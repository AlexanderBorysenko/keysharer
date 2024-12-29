import Bun from 'bun';
import { createYoga } from 'graphql-yoga';
import { schema } from './graphql/schema';
import { client } from './db/client';
import { initializeDatabase } from './db/initialize';
import type { AppQraphQLContext } from '../types/AppQraphQLContext';
import { getContextUser, unsafeGetContextUser } from './models/user/service/getContextUser';
import { makeHandler } from 'graphql-ws/lib/use/bun';
import { type ExecutionArgs } from "@envelop/types";
import { join } from 'path';
import { useCookies } from '@whatwg-node/server-plugin-cookies';
import { env } from 'process';
import userActiveSessionsService from './models/user/service/userActiveSessionsService';
import { publishOnlineStatusChanged } from './models/user/resolvers/user.onlineStatusChanged.subscription';
import queueUserAction from './services/queueUserAction';
import { types } from 'cassandra-driver';
import { publishOnlineServerPing } from './models/user/resolvers/user.onlineServerPing.subscription';
import { usersOnlinePingPongIterationIdsStorage, usersOnlinePingPongIterationIntervalsStorage } from './models/user/storage/usersOnlinePingPongStorage';

async function startServer() {
    try {
        await client.connect();
        console.info('Підключено до Cassandra успішно');

        await initializeDatabase();
        console.info('База даних ініціалізована');

        const yoga = createYoga<AppQraphQLContext>({
            schema,
            graphiql: {
                subscriptionsProtocol: 'WS',
            },
            context: async (context: AppQraphQLContext) => {
                return {
                    ...context,
                    user: await getContextUser(context)
                }
            },
            cors: {
                credentials: true,
                origin: '*',
            },
            landingPage: false,
            graphqlEndpoint: '/',
            plugins: [
                useCookies()
            ]
        });

        const websocketHandler = makeHandler({
            schema,
            execute: (args: ExecutionArgs) => args.rootValue.execute(args),
            subscribe: (args: ExecutionArgs) => args.rootValue.subscribe(args),

            onSubscribe: async (context, msg) => {
                const { schema, execute, subscribe, contextFactory, parse, validate } = yoga.getEnveloped({
                    ...context,
                    req: context.extra.request,
                    socket: context.extra.socket,
                    params: msg.payload,
                })

                const args = {
                    schema,
                    operationName: msg.payload.operationName,
                    document: parse(msg.payload.query),
                    variableValues: msg.payload.variables,
                    contextValue: await contextFactory(),
                    rootValue: {
                        execute,
                        subscribe
                    }
                }

                const errors = validate(args.schema, args.document)
                if (errors.length) return errors
                return args
            },
            onConnect: async (context) => {
                const user = await getContextUser(context);
                if (!user) {
                    console.log('\nUser not found in onConnect\n');
                    return;
                }
                const pingPongId: string = context.connectionParams?.pingPongId as string;
                if (!pingPongId) {
                    console.log('\nPingPongId not found in onConnect\n');
                    return;
                }

                queueUserAction(user.username, async () => {
                    console.log('\n===============================');
                    await userActiveSessionsService.updateUsersActiveSessionsCount(user.id, 'increment');
                    await publishOnlineStatusChanged({ userId: user.id });

                    const activeSessionsCount = await userActiveSessionsService.getUserActiveSessionsCount(user.id);
                    console.log('Active Sessions:', activeSessionsCount);
                    console.log('User connected:', user.username);
                    console.log('===============================\n');
                });
                usersOnlinePingPongIterationIdsStorage.set(pingPongId, '');
                usersOnlinePingPongIterationIntervalsStorage.set(pingPongId, setInterval(async () => {
                    const pingPongIterationId = types.TimeUuid.now().toString();
                    await publishOnlineServerPing({
                        pingPongIterationId: types.Uuid.fromString(pingPongIterationId),
                        userId: user.id,
                        pingPongId: types.Uuid.fromString(pingPongId)
                    });
                    setTimeout(() => {
                        if (usersOnlinePingPongIterationIdsStorage.get(pingPongId) !== pingPongIterationId) {
                            context.extra.socket.close();
                        }
                    }, 5000)
                }, 10000));
            },
            onClose: async (context) => {
                const user = await unsafeGetContextUser(context);
                if (!user) {
                    console.log('\nUser not found in onClose\n');
                    return;
                }
                const pingPongId: string = context.connectionParams?.pingPongId as string;
                if (!pingPongId) {
                    console.log('\nPingPongId not found in onClose\n');
                    return;
                }

                clearInterval(usersOnlinePingPongIterationIntervalsStorage.get(pingPongId));
                usersOnlinePingPongIterationIntervalsStorage.delete(pingPongId);
                usersOnlinePingPongIterationIdsStorage.delete(pingPongId);

                queueUserAction(user.username, async () => {
                    console.log('\n===============================');
                    await userActiveSessionsService.updateUsersActiveSessionsCount(user.id, 'decrement');
                    await publishOnlineStatusChanged({ userId: user.id });

                    const activeSessionsCount = await userActiveSessionsService.getUserActiveSessionsCount(user.id);
                    console.log('Active Sessions:', activeSessionsCount);

                    console.log('User disconnected:', user.username);
                    console.log('===============================\n');
                });
            },
        })

        const PUBLIC_DIR = join(process.cwd(), 'public');

        const server = Bun.serve({
            fetch: async (request: Request, server: Bun.Server): Promise<Response> => {
                // Перевірка на WebSocket-запит
                if (server.upgrade(request)) {
                    return new Response()
                }

                const url = new URL(request.url);
                const pathName = url.pathname;
                // Спробуємо повернути файл лише якщо шлях починається на /public/
                if (pathName.startsWith('/public/')) {
                    const relativePath = pathName.slice('/public/'.length);
                    const filePath = join(PUBLIC_DIR, relativePath);

                    try {
                        const file = Bun.file(filePath);
                        if (!file) {
                            return new Response('Not Found', { status: 404 });
                        }

                        const headers = new Headers();
                        const allowedOrigins = ['http://app.keysharer.com', 'http://localhost'];
                        const origin = request.headers.get('Origin') || '';
                        if (allowedOrigins.includes(origin)) {
                            headers.set('Access-Control-Allow-Origin', origin);
                        } else {
                            headers.set('Access-Control-Allow-Origin', '');
                        }
                        headers.set('Access-Control-Allow-Credentials', 'true');
                        headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
                        headers.set('Access-Control-Allow-Headers', 'Content-Type');

                        // If there's an OPTIONS request for CORS preflight:
                        if (request.method === 'OPTIONS') {
                            return new Response(null, { headers });
                        }

                        return new Response(file, { headers });
                    } catch (e) {
                        return new Response('Not Found', { status: 404 });
                    }
                }

                //@ts-ignore
                return yoga.fetch(request, server);
            },
            websocket: websocketHandler,
            port: 4000,
        });

        console.info(`Server started on http://localhost:${server.port}`);
    } catch (error) {
        client.shutdown();
        console.error('Помилка підключення або ініціалізації Cassandra:', error);
    }
}

startServer();
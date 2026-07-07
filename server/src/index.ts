import Bun from 'bun';
import { createYoga } from 'graphql-yoga';
import { schema } from './graphql/schema';
import { client } from './db/client';
import { initializeDatabase } from './db/initialize';
import type { AppQraphQLContext } from '../types/AppQraphQLContext';
import { getContextUser } from './models/user/service/getContextUser';
import { makeHandler } from 'graphql-ws/lib/use/bun';
import { type ExecutionArgs } from "@envelop/types";
import { join } from 'path';
import { useCookies } from '@whatwg-node/server-plugin-cookies';
import { env } from 'process';
import userActiveSessionsService from './models/user/service/userActiveSessionsService';
import { publishOnlineStatusChanged } from './models/user/resolvers/user.onlineStatusChanged.subscription';
import queueUserAction from './services/queueUserAction';

const resolveAllowOrigin = (request: Request): string => {
    const requestOrigin = request.headers.get('origin') || '';
    const allowedOrigins = ['https://app.keysharer.com', '//localhost'];
    return allowedOrigins.some(allowedOrigin => requestOrigin.includes(allowedOrigin)) ? requestOrigin : '';
}

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
            cors: request => {
                return {
                    origin: resolveAllowOrigin(request),
                    credentials: true,
                };
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
                    // graphql-ws treats a falsy return other than `false` as an implicit
                    // acknowledgement of the connection. Reject explicitly so the socket
                    // is closed (4403) and the client reconnects with fresh credentials.
                    return false;
                }

                // Stash presence identity synchronously, before the increment is even
                // enqueued. graphql-ws acks the connection as soon as onConnect returns,
                // which can race ahead of the queued increment closure below; if onClose
                // fires in that window it must still know this connection is one that
                // will (eventually) be incremented, so it can enqueue a matching
                // decrement on the same per-user FIFO chain. queueUserAction serializes
                // by key, so the decrement enqueued in onClose is guaranteed to run after
                // this increment even when connect and disconnect happen back-to-back.
                (context as any).presenceUserId = user.id;
                (context as any).presenceIncremented = true;

                queueUserAction(user.id.toString(), async () => {
                    console.log('\n===============================');
                    await userActiveSessionsService.updateUsersActiveSessionsCount(user.id, 'increment');
                    await publishOnlineStatusChanged({ userId: user.id });

                    const activeSessionsCount = await userActiveSessionsService.getUserActiveSessionsCount(user.id);
                    console.log('Active Sessions:', activeSessionsCount);
                    console.log('User connected:', user.username);
                    console.log('===============================\n');
                });
            },
            onClose: async (context) => {
                const presenceUserId = (context as any).presenceUserId;
                const presenceIncremented = (context as any).presenceIncremented;

                // Only decrement connections whose onConnect got far enough to enqueue an
                // increment (rejected/unauthenticated connections return before setting
                // this flag, so they never reach here). Identity comes from the verified
                // id stashed there, never from an unverified (jwt.decode-based)
                // re-derivation here. We enqueue the decrement rather than wait for the
                // increment to have completed: queueUserAction serializes per user id in
                // FIFO order, so enqueueing on the same key is enough to guarantee this
                // decrement runs after that increment, even for a connect immediately
                // followed by a disconnect.
                if (!presenceIncremented || !presenceUserId) {
                    return;
                }

                queueUserAction(presenceUserId.toString(), async () => {
                    console.log('\n===============================');
                    await userActiveSessionsService.updateUsersActiveSessionsCount(presenceUserId, 'decrement');
                    await publishOnlineStatusChanged({ userId: presenceUserId });

                    const activeSessionsCount = await userActiveSessionsService.getUserActiveSessionsCount(presenceUserId);
                    console.log('Active Sessions:', activeSessionsCount);

                    console.log('User disconnected:', presenceUserId.toString());
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

                        headers.set('Access-Control-Allow-Origin', resolveAllowOrigin(request));
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
            websocket: {
                ...websocketHandler,
                // graphql-ws protocol keepAlive (client-sent Ping, our auto Pong reply) is
                // ordinary socket traffic and resets this timer. Now that the custom
                // app-level ping/pong loop is gone, this is what protects otherwise-healthy
                // sockets (throttled background tabs, mobile radio wake, brief network
                // blips) from being idle-timed-out. Set explicitly (matching Bun's own
                // default of 120s) so the behavior doesn't depend on an implicit default.
                idleTimeout: 120,
            },
            port: 4000,
        });

        console.info(`Server started on http://localhost:${server.port}`);
    } catch (error) {
        client.shutdown();
        console.error('Помилка підключення або ініціалізації Cassandra:', error);
    }
}

startServer();
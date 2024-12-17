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

async function startServer() {
    try {
        await client.connect();
        console.log('Підключено до Cassandra успішно');

        await initializeDatabase();
        console.log('База даних ініціалізована');

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
                origin: [env.SERVER_URL, env.CLIENT_URL],
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
                if (user) {
                    await userActiveSessionsService.updateUsersActiveSessionsCount(user.id, 'increment');
                    await publishOnlineStatusChanged({
                        userId: user.id,
                    });
                }
            },
            onDisconnect: async (context, code, reason) => {
                const user = await unsafeGetContextUser(context);
                if (!user) {
                    console.log('Користувач не знайдений', context);
                    return;
                }
                await userActiveSessionsService.updateUsersActiveSessionsCount(user.id, 'decrement');
                await publishOnlineStatusChanged({
                    userId: user.id,
                });
            }
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

                    const allowedExtensions = ['.html', '.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.json'];
                    const ext = relativePath.slice(relativePath.lastIndexOf('.'));
                    if (!allowedExtensions.includes(ext)) {
                        return new Response('Not Found', { status: 404 });
                    }

                    try {
                        return new Response(Bun.file(filePath));
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

        console.log(`Сервер запущено на http://localhost:${server.port}`);
    } catch (error) {
        client.shutdown();
        console.error('Помилка підключення або ініціалізації Cassandra:', error);
    }
}

startServer();
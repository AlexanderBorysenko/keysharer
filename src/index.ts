import Bun from 'bun';
import { createYoga } from 'graphql-yoga';
import { schema } from './graphql/schema';
import { client } from './db/client';
import { initializeDatabase } from './db/initialize';
import type { AppQraphQLContext } from '../types/AppQraphQLContext';
import { getContextUser } from './models/user/service/getContextUser';
import { makeHandler } from 'graphql-ws/lib/use/bun';
import { type ExecutionArgs } from "@envelop/types";

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
            landingPage: false,
            graphqlEndpoint: '/',
        });

        const websocketHandler = makeHandler({
            schema,
            execute: (args: ExecutionArgs) => args.rootValue.execute(args),
            subscribe: (args: ExecutionArgs) => args.rootValue.subscribe(args),
            onSubscribe: async (ctx, msg) => {
                const { schema, execute, subscribe, contextFactory, parse, validate } = yoga.getEnveloped({
                    ...ctx,
                    req: ctx.extra.request,
                    socket: ctx.extra.socket,
                    params: msg.payload
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
        })

        const server = Bun.serve({
            fetch: (request: Request, server: Bun.Server): Promise<Response> | Response => {
                // Upgrade the request to a WebSocket
                if (server.upgrade(request)) {
                    return new Response()
                }
                //@ts-ignore
                return yoga.fetch(request, server)
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

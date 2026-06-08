import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { pubsub } from "../../../graphql/pubSub";
import { isAuthenticatedMiddleware } from "../middleware/isAuthenticatedMiddleware";
import { types } from "cassandra-driver";

export const onlineServerPingDefs = `
type Subscription {
    onlineServerPing(pingPongId: ID!): String!
}
`;

export const onlineServerPingSubscription = {
    subscribe: async (_: unknown, { pingPongId }: { pingPongId: string }, context: AppQraphQLContext) => {
        const user = await isAuthenticatedMiddleware(context);
        return pubsub.subscribe(`ONLINE_SERVER_PING_${pingPongId}_${user.id.toString()}`);
    },
    resolve: (pingPongIterationId: string) => {
        return pingPongIterationId;
    },
};

export const publishOnlineServerPing = async ({
    pingPongId,
    userId,
    pingPongIterationId
}: {
    pingPongId: types.Uuid;
    userId: types.Uuid;
    pingPongIterationId: types.Uuid;
}) => {
    pubsub.publish(`ONLINE_SERVER_PING_${pingPongId.toString()}_${userId.toString()}`, pingPongIterationId.toString());
};
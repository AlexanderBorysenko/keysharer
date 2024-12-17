import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { pubsub } from "../../../graphql/pubSub";
import { isAuthenticatedMiddleware } from "../middleware/isAuthenticatedMiddleware";
import { types } from "cassandra-driver";
import userActiveSessionsService from "../service/userActiveSessionsService";

export const onlineStatusChangedDefs = `
type Subscription {
    onlineStatusChanged(userId: ID!): Boolean!
}
`;

export const onlineStatusChangedSubscription = {
    subscribe: async (_: unknown, { userId }: { userId: string }, context: AppQraphQLContext) => {
        const user = await isAuthenticatedMiddleware(context);
        return pubsub.subscribe(`ONLINE_STATUS_CHANGED_${userId}`);
    },
    resolve: (payload: boolean) => {
        return payload;
    }
};

export const publishOnlineStatusChanged = async ({
    userId,
}: {
    userId: types.Uuid;
}) => {
    const isOnline = userActiveSessionsService.isUserOnline(userId);
    pubsub.publish(`ONLINE_STATUS_CHANGED_${userId.toString()}`, isOnline);
};
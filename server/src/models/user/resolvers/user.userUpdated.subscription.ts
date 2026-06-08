import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { pubsub } from "../../../graphql/pubSub";
import { isAuthenticatedMiddleware } from "../middleware/isAuthenticatedMiddleware";
import { findUser } from "../service/findUser";
import type { User } from "../user.types";
import { types } from "cassandra-driver";

export const userUpdatedSubscriptionDefs = `
type Subscription {
    userUpdated: User!
}
`;

export const userUpdatedSubscription = {
    subscribe: async (_: unknown, __: unknown, context: AppQraphQLContext) => {
        const user = await isAuthenticatedMiddleware(context);
        return pubsub.subscribe(`USER_UPDATED_${user.id.toString()}`);
    },
    resolve: async (payload: { userId: types.Uuid }) => {
        const user = await findUser({
            id: payload.userId,
        });
        return user;
    }
};

export const publishUserUpdated = async (userId: types.Uuid) => {
    pubsub.publish(`USER_UPDATED_${userId.toString()}`, { userId });
};
import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { pubsub } from "../../../graphql/pubSub";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import type { TMessage } from "../message.types";
import { getChatUserIds } from "../../chat/service/getChatUserIds";
import type { types } from "cassandra-driver";

export const newMessageSubscriptionDefs = `
type Subscription {
    newMessage: Message!
}
`;

export const newMessageSubscription = {
    subscribe: async (_: unknown, __: unknown, context: AppQraphQLContext) => {
        const user = await isAuthenticatedMiddleware(context);

        return pubsub.subscribe(`NEW_MESSAGE_${user.id.toString()}`);
    },
    resolve: (payload: TMessage) => {
        return payload;
    }
};

export const publishMessageSent = async ({ message, userIds }: { message: TMessage, userIds?: types.Uuid[] }) => {
    userIds = userIds || await getChatUserIds(message.chat_id);
    userIds.forEach((userId) => {
        pubsub.publish(`NEW_MESSAGE_${userId.toString()}`, message);
    });
};
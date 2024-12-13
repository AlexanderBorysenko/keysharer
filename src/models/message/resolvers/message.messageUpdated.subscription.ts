import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { pubsub } from "../../../graphql/pubSub";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import type { TMessage } from "../message.types";
import { getChatUserIds } from "../../chat/service/getChatUserIds";
import type { types } from "cassandra-driver";

export const messageUpdatedSubscriptionDefs = `
type Subscription {
    messageUpdated: Message!
}
`;

export const messageUpdatedSubscription = {
    subscribe: async (_: unknown, __: unknown, context: AppQraphQLContext) => {
        const user = await isAuthenticatedMiddleware(context);

        return pubsub.subscribe(`MESSAGE_UPDATED_${user.id.toString()}`);
    },
    resolve: (payload: TMessage) => {
        return payload;
    }
};

export const publishMessageUpdated = async ({ message, userIds }: { message: TMessage, userIds?: types.Uuid[] }) => {
    userIds = userIds || await getChatUserIds({
        chatId: message.chat_id
    });

    userIds.forEach((userId) => {
        pubsub.publish(`MESSAGE_UPDATED_${userId.toString()}`, message);
    });
};
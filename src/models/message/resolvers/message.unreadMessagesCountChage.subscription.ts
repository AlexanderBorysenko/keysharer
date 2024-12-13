import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { pubsub } from "../../../graphql/pubSub";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import type { types } from "cassandra-driver";
import messageDBService from "../service/messageDBService";
import { getChatUserIds } from "../../chat/service/getChatUserIds";

export const unreadMessagesCountChangeDefs = `
type Subscription {
    unreadMessagesCountChange: UnreadMessagesCount!
}

type UnreadMessagesCount {
    chatId: ID!
    unreadCount: Int!
}
`;

export const unreadMessagesCountChangeSubscription = {
    subscribe: async (_: unknown, __: unknown, context: AppQraphQLContext) => {
        const user = await isAuthenticatedMiddleware(context);
        return pubsub.subscribe(`UNREAD_MESSAGES_COUNT_CHANGE_${user.id.toString()}`);
    },
    resolve: (payload: { chatId: string; unreadCount: number }) => {
        return payload;
    }
};

export const publishUnreadMessagesCountChange = async ({
    chatId,
    ownerId,
    userIds
}: {
    chatId: types.Uuid;
    ownerId: types.Uuid;
    userIds?: types.Uuid[];
}) => {
    const recepientIds = (userIds || await getChatUserIds({
        chatId,
        exclude: [ownerId]
    }));

    recepientIds.forEach((recepientId) => {
        const unreadCount = messageDBService.getUnreadMessagesCount({
            userId: recepientId,
            chatId,
        });
        pubsub.publish(`UNREAD_MESSAGES_COUNT_CHANGE_${recepientId.toString()}`, {
            chatId: chatId.toString(),
            unreadCount
        });
    });
};
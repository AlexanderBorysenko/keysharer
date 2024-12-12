import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { pubsub } from "../../../graphql/pubSub";
import { isAuthenticatedMiddleware } from "../middleware/isAuthenticatedMiddleware";
import { types } from "cassandra-driver";
import { getChatUserIds } from "../../chat/service/getChatUserIds";

export const typingStatusUpdatedDefs = `
type Subscription {
    typingStatusUpdated: UserTypingStatus!
}

type UserTypingStatus {
    userId: ID!
    chatId: ID!
    isTyping: Boolean!
}
`;

export const typingStatusUpdated = {
    subscribe: async (_: unknown, __: unknown, context: AppQraphQLContext) => {
        const user = await isAuthenticatedMiddleware(context);
        return pubsub.subscribe(`TYPING_TO_USER_${user.id.toString()}`);
    },
    resolve: (payload: { userId: string; chatId: string; isTyping: boolean }) => {
        return payload;
    }
};

export const publishTypingStatusUpdated = async ({
    chatId,
    userId,
    isTyping,
    userIds
}: {
    chatId: types.Uuid;
    userId: types.Uuid;
    userIds?: types.Uuid[];
    isTyping: boolean;
}) => {
    userIds = (userIds || await getChatUserIds(chatId))
        .filter((id) => id.toString() !== userId.toString());

    userIds.forEach((listeningUserId) => {
        pubsub.publish(`TYPING_TO_USER_${listeningUserId.toString()}`, {
            userId: userId.toString(),
            chatId: chatId.toString(),
            isTyping
        });
    });
};


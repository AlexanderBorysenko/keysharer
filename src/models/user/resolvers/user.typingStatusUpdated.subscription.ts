import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { pubsub } from "../../../graphql/pubSub";
import { isAuthenticatedMiddleware } from "../middleware/isAuthenticatedMiddleware";
import { types } from "cassandra-driver";
import { getChatUsersIds } from "../../chat/service/getChatUsersIds";

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
        return pubsub.subscribe(`TYPING_TO_USER_${user.id}`);
    },
    resolve: (payload: { userId: string; chatId: string; isTyping: boolean }) => {
        return payload;
    }
};

export const publishTypingStatusUpdated = async ({
    chatId,
    userId,
    isTyping
}: {
    chatId: types.Uuid;
    userId: types.Uuid;
    isTyping: boolean;
}) => {
    const chatUsersIds = (await getChatUsersIds(chatId)).filter((id) => id.toString() !== userId.toString());

    chatUsersIds.forEach((userId) => {
        pubsub.publish(`TYPING_TO_USER_${userId.toString()}`, {
            userId: userId.toString(),
            chatId: chatId.toString(),
            isTyping
        });
    });
};


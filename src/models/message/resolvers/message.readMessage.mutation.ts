import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import { types } from "cassandra-driver";
import { isUserAChatMemberMiddleware } from "../../chat/service/isUserAChatMemeber";
import messageDBService from "../service/messageDBService";
import { publishMessageUpdated } from "./message.messageUpdated.subscription";
import { getChatUserIds } from "../../chat/service/getChatUserIds";
import { publishUnreadMessagesCountChange } from "./message.unreadMessagesCountChage.subscription";

export type ReadMessageInput = {
    chatId: types.Uuid;
    messageId: types.TimeUuid;
};

export const readMessageDefs = `
type Mutation {
    readMessage(messageId: ID!): Boolean!
}
`;

export const readMessageMutation = async (
    _: any,
    { messageId }: { messageId: types.TimeUuid },
    context: AppQraphQLContext
): Promise<boolean> => {
    const user = await isAuthenticatedMiddleware(context);
    const message = await messageDBService.getMessage({ messageId });
    const chatUserIds = await getChatUserIds({
        chatId: message.chat_id,
    });
    await isUserAChatMemberMiddleware({
        chatId: message.chat_id,
        userId: user.id,
        userIds: chatUserIds,
    });
    // Prevent the user from marking the message as read if they are the sender
    if (message.user_id === user.id) {
        return true;
    }

    try {
        await messageDBService.readMessage({
            chatId: message.chat_id,
            messageId,
            userId: user.id,
        })

        await publishMessageUpdated({
            message: {
                ...message,
                is_read: true,
            },
            userIds: chatUserIds,
        })
        await publishUnreadMessagesCountChange({
            chatId: message.chat_id,
            userIds: [user.id],
            ownerId: message.user_id,
        });

        return true;
    } catch (error) {
        console.error(error as any);
        throw error;
    }
};
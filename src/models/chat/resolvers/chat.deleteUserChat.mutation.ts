import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import { client } from "../../../db/client";
import { throwUnexpectedError } from "../../../errors/throwUnexpectedError";
import { publishMyChatCardsUpdate } from "./chat.myChatCardsUpdate.subscription";
import type { types } from "cassandra-driver";

export type DeleteUserChatInput = {
    chatId: types.Uuid,
    userId?: types.Uuid,
};

export const deleteUserChatDefs = `
input DeleteUserChatInput {
    chatId: ID!,
    userId: ID
}

type Mutation {
    deleteUserChat(input: DeleteUserChatInput!): Boolean!
}
`

export const deleteUserChat = async (
    _: any,
    { input: { chatId, userId } }: { input: DeleteUserChatInput },
    context: AppQraphQLContext
): Promise<boolean> => {
    const user = await isAuthenticatedMiddleware(context);

    const queries = userId
        ? [
            {
                query: 'DELETE FROM user_chat WHERE chat_id = ? AND user_id = ?',
                params: [chatId, userId],
            },
        ]
        : [
            {
                query: 'DELETE FROM chats WHERE id = ?',
                params: [chatId],
            },
            {
                query: 'DELETE FROM user_chat WHERE chat_id = ?',
                params: [chatId],
            },
            {
                query: 'DELETE FROM messages WHERE chat_id = ?',
                params: [chatId],
            },
        ];

    try {
        await client.batch(queries, { prepare: true });

        if (!userId) {
            publishMyChatCardsUpdate(user.id);
        }

        return true;
    } catch (error) {
        console.error(error);
        throwUnexpectedError('Error deleting chat');
        return false;
    }
};
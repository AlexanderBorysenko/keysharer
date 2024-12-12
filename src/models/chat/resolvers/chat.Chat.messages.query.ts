import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import { client } from "../../../db/client";
import type { Chat } from "../chat.types";
import type { TMessage } from "../../message/message.types";
import type { types } from "cassandra-driver";
import { isUserAChatMemberMiddleware } from "../service/isUserAChatMemeber";
import { rowToObject } from "../../../utils/rowToObject";

export const chatMessages = async (
    chat: Chat,
    { lastMessageId = null }: { lastMessageId: types.TimeUuid | null },
    context: AppQraphQLContext
): Promise<TMessage[]> => {
    const user = await isAuthenticatedMiddleware(context);
    await isUserAChatMemberMiddleware({
        chatId: chat.id,
        userId: user.id,
    });

    // Fetch messages with pagination
    const pageSize = 2;
    const messagesQuery = lastMessageId
        ? `SELECT * FROM messages 
        WHERE chat_id = ${chat.id.toString()} 
        AND id < ${lastMessageId.toString()} 
        LIMIT ${pageSize}`
        : `SELECT * FROM messages 
        WHERE chat_id = ${chat.id.toString()} 
        ORDER BY id DESC 
        LIMIT ${pageSize}`;
    const messagesResult = await client.execute(messagesQuery, [], {
        prepare: true,
    });

    const messages = messagesResult.rows.map((row) => rowToObject<TMessage>(row));

    if (!lastMessageId) {
        messages.reverse();
    }

    return messages;
};

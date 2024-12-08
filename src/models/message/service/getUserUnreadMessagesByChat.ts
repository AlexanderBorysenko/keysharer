import type { types } from "cassandra-driver";
import { client } from "../../../db/client";

export const getUserUnreadMessagesByChat = async (userId: types.Uuid, chatId: types.Uuid) => {
    if (!userId) return 0;

    try {
        const unreadCountQuery = `
            SELECT COUNT(*) AS unread_messages_count
            FROM messages
            WHERE chat_id = ? AND user_id = ? AND status = 'sent'
            ALLOW FILTERING
        `;
        const unreadCountResult = await client.execute(unreadCountQuery, [chatId, userId], { prepare: true });
        return unreadCountResult.first().unread_messages_count;
    } catch (error) {
        console.error('Error getting unread messages count', error);
        return 0;
    }
};

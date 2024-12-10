import type { types } from "cassandra-driver";
import { client } from "../../../db/client";

export const getChatUsersIds = async (chatId: types.Uuid): Promise<types.Uuid[]> => {
    try {
        const query = 'SELECT user_id FROM user_chat WHERE chat_id = ?';
        const result = await client.execute(query, [chatId], { prepare: true });

        return result.rows.map((row) => row.user_id);
    } catch (error) {
        console.error('Error getting chat users ids', error);
        throw error;
    }
}
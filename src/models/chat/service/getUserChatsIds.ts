import type { types } from "cassandra-driver";
import { client } from "../../../db/client";

export const getUserChatsIds = async (userId: types.Uuid): Promise<types.Uuid[]> => {
    const chatIdsQuery = 'SELECT chat_id FROM user_chat WHERE user_id = ?';
    const chatIdsResult = await client.execute(chatIdsQuery, [userId], { prepare: true });

    return chatIdsResult.rows.map(row => row.chat_id);
}
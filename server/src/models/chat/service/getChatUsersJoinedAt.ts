import type { types } from "cassandra-driver";
import { client } from "../../../db/client";
import { rowToObject } from "../../../utils/rowToObject";

export const getChatUsersJoinedAt = async (chatId: types.Uuid): Promise<{
    user_id: types.Uuid;
    timestamp: Date;
}[]> => {
    try {
        const query = "SELECT user_id, timestamp FROM user_chat WHERE chat_id = ?";
        const result = await client.execute(query, [chatId], { prepare: true });

        return result.rows.map(row => rowToObject(row));
    } catch (error) {
        console.error("Error getting chat users joined at", error);
        throw error;
    }
};
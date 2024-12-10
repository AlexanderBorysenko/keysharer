import type { types } from "cassandra-driver";
import { client } from "../../../db/client";

export const getChatMessagesIds = async (chatId: types.Uuid): Promise<types.Uuid[]> => {
    try {
        const query =
            "SELECT id as message_id FROM app_keyspace.messages WHERE chat_id = ?"
        return client.execute(query, [chatId], { prepare: true }).then((result) => {
            return result.rows.map((row) => row.message_id);
        });
    } catch (error) {
        console.error('Error getting chat messages ids', error);
        throw error;
    }
}
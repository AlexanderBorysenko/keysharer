import type { types } from "cassandra-driver";
import { client } from "../../../db/client";
import type { User } from "../../user/user.types";

export const getChatUsersIds = async (chatId: types.Uuid): Promise<types.Uuid[]> => {
    const query = 'SELECT user_id FROM user_chat WHERE chat_id = ?';
    const result = await client.execute(query, [chatId], { prepare: true });

    return result.rows.map((row) => row.user_id);
}
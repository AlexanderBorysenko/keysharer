import type { types } from "cassandra-driver";
import { getChatUsersIds } from "./getChatUsersIds";
import { client } from "../../../db/client";

export const getChatUsers = async (chatId: types.Uuid, excludeUserId: types.Uuid | null) => {
    const userIds = (await getChatUsersIds(chatId)).filter(id => id !== excludeUserId);
    const usersQuery = 'SELECT * FROM users WHERE id IN ?';
    const usersResult = await client.execute(usersQuery, [userIds], { prepare: true });

    return usersResult.rows;
};
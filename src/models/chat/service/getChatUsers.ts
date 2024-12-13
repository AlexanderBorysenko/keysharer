import type { types } from "cassandra-driver";
import { getChatUserIds } from "./getChatUserIds";
import { client } from "../../../db/client";
import type { User } from "../../user/user.types";
import { rowToObject } from "../../../utils/rowToObject";

export const getChatUsers = async (chatId: types.Uuid, excludeUserId: types.Uuid | null = null): Promise<User[]> => {
    try {
        const userIds = (await getChatUserIds({
            chatId,
            exclude: excludeUserId ? [excludeUserId] : [],
        }));
        const usersQuery = 'SELECT * FROM users WHERE id IN ?';
        const usersResult = await client.execute(usersQuery, [userIds], { prepare: true });

        return usersResult.rows.map(row => rowToObject<User>(row));
    } catch (error) {
        console.error('Error getting chat users', error);
        throw error;
    }
};
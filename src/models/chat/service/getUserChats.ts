import type { types } from "cassandra-driver";
import { getUserChatsIds } from "./getUserChatsIds";
import { client } from "../../../db/client";

export const getUserChats = async (userId: types.Uuid) => {
    try {
        const chatIds: types.Uuid[] = await getUserChatsIds(userId);
        if (chatIds.length === 0) return [];

        const chatsQuery = 'SELECT * FROM chats WHERE id IN ?';
        const chatsResult = await client.execute(chatsQuery, [chatIds], { prepare: true });
        return chatsResult.rows;
    } catch (error) {
        console.error('Error getting user chats', error);
        throw new Error('Error getting user chats');
    }
}
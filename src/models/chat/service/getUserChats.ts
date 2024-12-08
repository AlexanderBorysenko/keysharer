import type { types } from "cassandra-driver";
import { getUserChatsIds } from "./getUserChatsIds";
import { client } from "../../../db/client";

export const getUserChats = async (userId: types.Uuid) => {
    const chatIds: types.Uuid[] = await getUserChatsIds(userId);

    const chatsQuery = 'SELECT * FROM chats WHERE id IN ?';
    const chatsResult = await client.execute(chatsQuery, [chatIds], { prepare: true });

    return chatsResult.rows;
}
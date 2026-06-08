import type { types } from "cassandra-driver";
import { getUserChatsIds } from "./getUserChatsIds";
import { client } from "../../../db/client";
import type { Chat } from "../chat.types";
import { rowToObject } from "../../../utils/rowToObject";

export const getUserChats = async (userId: types.Uuid): Promise<Chat[]> => {
	try {
		const chatIds: types.Uuid[] = await getUserChatsIds(userId);
		if (chatIds.length === 0) return [];

		const chatsQuery =
			"SELECT * FROM chats WHERE id IN ? ORDER BY updated_at DESC";
		const chatsResult = await client.execute(chatsQuery, [chatIds], {
			prepare: true,
		});
		return chatsResult.rows.map((row) => rowToObject<Chat>(row));
	} catch (error) {
		console.error("Error getting user chats", error);
		throw error;
	}
};

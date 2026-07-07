import type { types } from "cassandra-driver";
import { client } from "../../../db/client";

interface GetChatUserIdsOptions {
	chatId: types.Uuid;
	exclude?: types.Uuid[];
}

export const getChatUserIds = async ({
	chatId,
	exclude = [],
}: GetChatUserIdsOptions): Promise<types.Uuid[]> => {
	try {
		const query = "SELECT user_id FROM user_chat WHERE chat_id = ?";
		const result = await client.execute(query, [chatId], { prepare: true });

		let userIds = result.rows.map((row) => row.user_id);

		if (exclude.length > 0) {
			const excludeSet = new Set(exclude.map((id) => id.toString()));
			userIds = userIds.filter((userId) => !excludeSet.has(userId.toString()));
		}

		return userIds;
	} catch (error) {
		console.error("Error getting chat user ids", error);
		throw error;
	}
};

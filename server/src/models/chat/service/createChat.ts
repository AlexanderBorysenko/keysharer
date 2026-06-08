import { client } from "../../../db/client";
import type { Chat } from "../chat.types";
import { types } from "cassandra-driver";
import { getChat } from "./getChat";
import { addUserToChat } from "./addUserToChat";

export const createChat = async ({
	ownerId,
	name,
	avatar,
	userIds,
}: {
	ownerId: types.Uuid;
	name: string;
	avatar: string;
	userIds: types.Uuid[];
}): Promise<Chat> => {
	// Генерація унікального ідентифікатора для нового чату
	const chatId = types.Uuid.random();

	// Підготовка запитів для пакетного виконання
	const queries = [
		{
			query: "INSERT INTO chats (id, name, avatar, owner_id, updated_at) VALUES (?, ?, ?, ?, ?)",
			params: [chatId, name, avatar, ownerId, new Date()],
		},
	];

	if (!userIds.map((id) => id.toString()).includes(ownerId.toString())) {
		userIds.push(ownerId);
	}
	await Promise.all(
		userIds.map(async (userId) => await addUserToChat({ chatId, userId }))
	);

	// Виконання пакетного запиту
	try {
		await client.batch(queries, { prepare: true });

		return await getChat(chatId);
	} catch (error) {
		console.error("Error creating chat", error);
		throw error;
	}
};

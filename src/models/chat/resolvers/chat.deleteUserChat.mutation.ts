import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import { client } from "../../../db/client";
import { throwUnexpectedError } from "../../../errors/throwUnexpectedError";
import type { types } from "cassandra-driver";
import { publishChatDeleted } from "./chat.deleteChat.subscription";
import { isUserAChatMemberMiddleware } from "../service/isUserAChatMemeber";
import { getChatUsersIds } from "../service/getChatUsersIds";

export type DeleteUserChatInput = {
	chatId: types.Uuid;
	userId?: types.Uuid;
};

export const deleteUserChatDefs = `
input DeleteUserChatInput {
	chatId: ID!,
	userId: ID
}

type Mutation {
	deleteUserChat(input: DeleteUserChatInput!): Boolean!
}
`;

const getDeleteQueries = (chatId: types.Uuid, userId?: types.Uuid) => {
	if (userId) {
		return [
			{
				query: "DELETE FROM user_chat WHERE chat_id = ? AND user_id = ?",
				params: [chatId, userId],
			},
		];
	}
	return [
		{
			query: "DELETE FROM chats WHERE id = ?",
			params: [chatId],
		},
		{
			query: "DELETE FROM user_chat WHERE chat_id = ?",
			params: [chatId],
		},
		{
			query: "DELETE FROM messages WHERE chat_id = ?",
			params: [chatId],
		},
	];
};

// Check if there are no users in the chat - delete the chat
const getAdditionalQueriesIfNoUsers = async (chatId: types.Uuid) => {
	const chatUsersIds = await getChatUsersIds(chatId);
	if (chatUsersIds.length === 0) {
		return [
			{
				query: "DELETE FROM chats WHERE id = ?",
				params: [chatId],
			},
			{
				query: "DELETE FROM messages WHERE chat_id = ?",
				params: [chatId],
			},
		];
	}
	return [];
};

export const deleteUserChat = async (
	_: any,
	{ input: { chatId, userId } }: { input: DeleteUserChatInput },
	context: AppQraphQLContext
): Promise<boolean> => {
	const user = await isAuthenticatedMiddleware(context);
	await isUserAChatMemberMiddleware(user.id, chatId);

	let queries = getDeleteQueries(chatId, userId);

	try {
		await client.batch(queries, { prepare: true });

		if (userId) {
			const additionalQueries = await getAdditionalQueriesIfNoUsers(chatId);
			await client.batch(additionalQueries, { prepare: true });
		}

		await publishChatDeleted(chatId);

		return true;
	} catch (error) {
		console.error(error);
		throwUnexpectedError("Error deleting chat");
		return false;
	}
};

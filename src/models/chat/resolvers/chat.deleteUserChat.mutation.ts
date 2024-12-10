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

export const deleteUserChat = async (
	_: any,
	{ input: { chatId, userId } }: { input: DeleteUserChatInput },
	context: AppQraphQLContext
): Promise<boolean> => {
	const user = await isAuthenticatedMiddleware(context);
	await isUserAChatMemberMiddleware(user.id, chatId);

	const chatUserIds = await getChatUsersIds(chatId);

	const queries: string[] = [];
	const targerUsersIds = userId ? [userId] : chatUserIds;
	targerUsersIds.forEach((userId) => {
		queries.push(`DELETE FROM user_chat WHERE chat_id = ${chatId} AND user_id = ${userId}`);
	});
	if (chatUserIds.length === targerUsersIds.length) {
		queries.push(`DELETE FROM chats WHERE id = ${chatId}`);
		queries.push(`DELETE FROM messages WHERE chat_id = ${chatId}`);
	}

	try {
		await client.batch(queries, { prepare: true });

		await publishChatDeleted(targerUsersIds, chatId);

		return true;
	} catch (error) {
		console.error(error);
		throwUnexpectedError("Error deleting chat");
		return false;
	}
};

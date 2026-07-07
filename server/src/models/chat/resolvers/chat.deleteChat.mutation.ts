import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import { client } from "../../../db/client";
import { throwUnexpectedError } from "../../../errors/throwUnexpectedError";
import type { types } from "cassandra-driver";
import { publishChatDeleted } from "./chat.deleteChat.subscription";
import { isUserAChatMemberMiddleware } from "../service/isUserAChatMemeber";
import { getChatUserIds } from "../service/getChatUserIds";
import messageDBService from "../../message/service/messageDBService";
import { publishChatUpdated } from "./chat.chatUpdated.subscription";
import { isUserAChatAdministratorMiddleware } from "../service/isUserAChatAdministrator";
import type { Queries } from "../../../../types/Queries";

export type DeleteChatInput = {
	chatId: types.Uuid;
};

export const deleteChatDefs = `
input DeleteChatInput {
	chatId: ID!,
	userId: ID
}

type Mutation {
	deleteChat(input: DeleteChatInput!): Boolean!
}
`;

export const deleteChat = async (
	_: any,
	{ input: { chatId } }: { input: DeleteChatInput },
	context: AppQraphQLContext
): Promise<boolean> => {
	const user = await isAuthenticatedMiddleware(context);
	await isUserAChatAdministratorMiddleware({
		chatReferense: chatId,
		userId: user.id,
	});
	const chatUserIds = await getChatUserIds({
		chatId,
	});

	const queries: Queries = [];
	chatUserIds.forEach((userId) => {
		queries.push({
			query: `DELETE FROM user_chat WHERE chat_id = ? AND user_id = ?`,
			params: [chatId, userId],
		});
	});
	queries.push({
		query: `DELETE FROM chats WHERE id = ?`,
		params: [chatId],
	});

	try {
		await client.batch([
			...queries,
			...await messageDBService.deleteChatMessagesBatch({
				chatId,
			}),
		], { prepare: true });
		await messageDBService.deleteChatUnreadCounters({
			chatId,
			userIds: chatUserIds,
		});

		await publishChatDeleted(chatUserIds, chatId);
		return true;
	} catch (error) {
		console.error(error);
		throwUnexpectedError("Error deleting chat");
		return false;
	}
};

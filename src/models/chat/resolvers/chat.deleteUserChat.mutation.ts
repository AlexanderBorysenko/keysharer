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
	const chatUserIds = await getChatUserIds({
		chatId,
	});
	await isUserAChatMemberMiddleware({
		chatId,
		userId: user.id,
		userIds: chatUserIds,
	});

	const queries: string[] = [];
	const targerUserIds = userId ? [userId] : chatUserIds;
	targerUserIds.forEach((userId) => {
		queries.push(`DELETE FROM user_chat WHERE chat_id = ${chatId} AND user_id = ${userId}`);
	});
	if (chatUserIds.length === targerUserIds.length) {
		queries.push(`DELETE FROM chats WHERE id = ${chatId}`);
	}

	try {
		await client.batch([
			...queries,
			...await messageDBService.deleteChatMessagesBatch({
				chatId,
				userIds: targerUserIds,
			}),
		], { prepare: true });
		await messageDBService.deleteChatUnreadCounters({
			chatId,
			userIds: targerUserIds,
		});

		await publishChatDeleted(targerUserIds, chatId);
		if (chatUserIds.length !== targerUserIds.length) {
			await publishChatUpdated(chatId);
		}
		return true;
	} catch (error) {
		console.error(error);
		throwUnexpectedError("Error deleting chat");
		return false;
	}
};

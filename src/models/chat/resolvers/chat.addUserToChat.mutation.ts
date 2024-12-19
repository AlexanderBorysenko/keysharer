import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { client } from "../../../db/client";
import { getChatUserIds } from "../service/getChatUserIds";
import { publishChatUpdated } from "./chat.chatUpdated.subscription";
import { types } from "cassandra-driver";
import { isUserAChatMemberMiddleware } from "../service/isUserAChatMemeber";
import { isEmailVerifiedMiddleware } from "../../user/middleware/isEmailVerifiedMiddleware";
import { throwConflictError } from "../../../errors/throwConflictError";

export type AddUserToChatInput = {
	chatId: types.Uuid;
	userId: types.Uuid;
};

export const addUserToChatDefs = `
input AddUserToChatInput {
    chatId: ID!
    userId: ID!
}

type Mutation {
    addUserToChat(input: AddUserToChatInput!): Boolean!
}
`;

export const addUserToChat = async (
	_: any,
	{ input: { chatId, userId } }: { input: AddUserToChatInput },
	context: AppQraphQLContext
): Promise<boolean> => {
	const user = await isEmailVerifiedMiddleware(context);

	// Check if the user performing the action is a member of the chat
	await isUserAChatMemberMiddleware({
		chatId,
		userId: user.id,
	});

	// Check if the user to be added is already a member of the chat
	const chatUserIds = await getChatUserIds({ chatId });
	if (chatUserIds.includes(userId)) {
		throwConflictError("User is already a member of the chat");
	}

	// Add the user to the chat
	const query = "INSERT INTO user_chat (chat_id, user_id) VALUES (?, ?)";
	await client.execute(query, [chatId, userId], { prepare: true });

	// Publish chat updated event
	await publishChatUpdated(chatId);

	return true;
};

import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { publishChatUpdated } from "./chat.chatUpdated.subscription";
import { types } from "cassandra-driver";
import { throwConflictError } from "../../../errors/throwConflictError";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import { isUserAChatAdministratorMiddleware } from "../service/isUserAChatAdministrator";
import { publishChatCreated } from "./chat.createChat.subscription";
import { getChatUserIds } from "../service/getChatUserIds";
import { addUserToChat } from "../service/addUserToChat";

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

export const addUserToChatMutation = async (
	_: any,
	{ input: { chatId, userId } }: { input: AddUserToChatInput },
	context: AppQraphQLContext
): Promise<boolean> => {
	const user = await isAuthenticatedMiddleware(context);
	await isUserAChatAdministratorMiddleware({
		chatReferense: chatId,
		userId: user.id,
	});

	// Check if the user to be added is already a member of the chat
	const chatUserIds = await getChatUserIds({ chatId });
	if (chatUserIds.includes(userId)) {
		throwConflictError("User is already a member of the chat");
	}

	// Add the user to the chat
	await addUserToChat({ chatId, userId });

	// Publish chat updated event
	await publishChatUpdated(chatId);
	await publishChatCreated({
		chatReference: chatId,
		userIds: [userId.toString()],
	});

	return true;
};

import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import { client } from "../../../db/client";
import { types } from "cassandra-driver";
import { prepareMessageTextContent } from "../../../db/utils/prepareMessageTextContent";
import { publishMessageSent } from "./message.newMessage.subscription";
import { isUserAChatMemberMiddleware } from "../../chat/service/isUserAChatMemeber";
import { encrypt } from "../../../utils/cryptoUtils";
import messageDBService from "../service/messageDBService";
import { publishUnreadMessagesCountChange } from "./message.unreadMessagesCountChage.subscription";
import { getChatUserIds } from "../../chat/service/getChatUserIds";
import { isEmailVerifiedMiddleware } from "../../user/middleware/isEmailVerifiedMiddleware";
import { messageSendDelayMiddleware } from "../middleware/MessageSendDelayMiddleware";

export type SendMessageInput = {
	chatId: types.Uuid;
	content: string;
};

export const sendMessageDefs = `
input SendMessageInput {
	chatId: ID!
	content: String!
}

type Mutation {
    sendMessage(input: SendMessageInput!): Boolean!
}
`;

export const sendMessageMutation = async (
	_: any,
	{ input: { chatId, content } }: { input: SendMessageInput },
	context: AppQraphQLContext
): Promise<boolean> => {
	const user = await isEmailVerifiedMiddleware(context);
	const chatUserIds = await getChatUserIds({
		chatId,
	});
	await isUserAChatMemberMiddleware({
		chatId,
		userId: user.id,
		userIds: chatUserIds,
	});

	// Check if user is sending messages too quickly
	await messageSendDelayMiddleware({ chatId: chatId, userId: user.id });

	// Generate a unique ID for the message
	const messageId = types.TimeUuid.now();

	// Encrypt Message
	content = prepareMessageTextContent(content);
	content = encrypt(content);

	try {
		await messageDBService.createMessage({
			messageId,
			chatId,
			userId: user.id,
			content,
		});

		const message = await messageDBService.getMessage({ messageId });

		await publishMessageSent({ message, userIds: chatUserIds });
		await publishUnreadMessagesCountChange({
			chatId,
			userIds: chatUserIds,
			ownerId: user.id,
		});
	} catch (error) {
		console.error(error as any);
		throw error;
	}

	return true;
};

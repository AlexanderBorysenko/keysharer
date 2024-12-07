import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import { client } from "../../../db/client";
import { types } from "cassandra-driver";
import { throwUserInputError } from "../../../errors/throwUserInputError";
import { prepareMessageTextContent } from "../../../db/utils/prepareMessageTextContent";
import { publishMessageSent } from "./message.newMessage.subscription";
import { mapRowIntoMessage } from "../service/mapRowIntoMessage";
import { isUserAChatMemberMiddleware } from "../../chat/service/isUserAChatMemeber";
import { encrypt } from "../../../utils/cryptoUtils";

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
	const user = await isAuthenticatedMiddleware(context);
	await isUserAChatMemberMiddleware(user.id, chatId);

	// Generate a unique ID for the message
	const messageId = types.TimeUuid.now();

	// Encrypt Message
	content = prepareMessageTextContent(content);
	content = encrypt(content);

	try {
		// Insert the message into the messages table
		const query = `INSERT INTO messages (id, chat_id, user_id, type, content, status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)`;
		const params = [
			messageId,
			chatId,
			user.id,
			"text",
			content,
			"sent",
			new Date(),
		];
		await client.execute(query, params, { prepare: true });

		const getMessageQuery = `SELECT * FROM messages WHERE id = ?`;
		const messageResult = await client.execute(
			getMessageQuery,
			[messageId],
			{ prepare: true }
		);
		const message = messageResult.rows[0];

		publishMessageSent(chatId, mapRowIntoMessage(message));
	} catch (error) {
		console.error(error as any);
		return throwUserInputError("Error sending message", {
			messages: {
				error: error as any,
			},
		});
	}

	return true;
};

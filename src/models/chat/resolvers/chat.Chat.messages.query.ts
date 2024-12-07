import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import { client } from "../../../db/client";
import type { Chat } from "../chat.types";
import type { TMessage } from "../../message/message.types";
import type { types } from "cassandra-driver";
import { isUserAChatMemberMiddleware } from "../service/isUserAChatMemeber";
import { decrypt } from "../../../utils/cryptoUtils";

export const chatMessages = async (
	chat: Chat,
	{ lastMessageId = null }: { lastMessageId: types.TimeUuid | null },
	context: AppQraphQLContext
): Promise<TMessage[]> => {
	console.log("lastMessageId", lastMessageId);

	const user = await isAuthenticatedMiddleware(context);
	await isUserAChatMemberMiddleware(user.id, chat.id);

	// Fetch messages with pagination
	const pageSize = 2;
	const messagesQuery = lastMessageId
		? `SELECT * FROM messages 
        WHERE chat_id = ${chat.id.toString()} 
        AND id < ${lastMessageId.toString()} 
        LIMIT ${pageSize}`
		: `SELECT * FROM messages 
        WHERE chat_id = ${chat.id.toString()} 
        LIMIT ${pageSize}`;
	const messagesResult = await client.execute(messagesQuery, [], {
		prepare: true,
	});

	return messagesResult.rows.map((row) => ({
		id: row.id,
		chat_id: row.chat_id,
		user_id: row.user_id,
		type: row.type,
		content: decrypt(row.content),
		status: row.status,
		timestamp: row.timestamp,
	}));
};

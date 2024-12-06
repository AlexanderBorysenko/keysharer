import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import { client } from "../../../db/client";
import { types } from "cassandra-driver";
import { throwUserInputError } from "../../../errors/throwUserInputError";
import { prepareMessageTextContent } from "../../../db/utils/prepareMessageTextContent";
import { publishMessageSent } from "./message.newMessage.subscription";
import { mapRowIntoMessage } from "../service/mapRowIntoMessage";
import { isUserAChatMemberMiddleware } from "../../chat/service/isUserAChatMemeber";

<<<<<<< HEAD
=======
export type SendMessageInput = {
    chatId: types.Uuid;
    content: string;
};

>>>>>>> 97a8b6f124f2183c0e51489470ba97596ec7d622
export const sendMessageDefs = `
type Mutation {
    sendMessage(chatId: ID!, content: String!): Boolean!
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

    content = prepareMessageTextContent(content);

    try {
        // Insert the message into the messages table
        const query = `INSERT INTO messages (id, chat_id, user_id, type, content, status, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const params = [messageId, chatId, user.id, 'text', content, 'sent', new Date()];
        await client.execute(query, params, { prepare: true });

        const getMessageQuery = `SELECT * FROM messages WHERE id = ?`;
        const messageResult = await client.execute(getMessageQuery, [messageId], { prepare: true });
        const message = messageResult.rows[0];

        publishMessageSent(chatId, mapRowIntoMessage(message));
    } catch (error) {
        console.error(error as any);
        return throwUserInputError('Error sending message', {
            messages: {
                error: error as any
            }
        });
    }


    return true;
};
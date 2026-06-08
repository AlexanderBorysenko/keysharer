import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import type { Chat } from "../chat.types";
import { getChat } from "../service/getChat";
import { isUserAChatMemberMiddleware } from "../service/isUserAChatMemeber";
import { types } from "cassandra-driver";

export const myChatDefs = `
type Query {
    myChat(chatId: ID!): Chat!
}
`;

export const myChat = async (
    _: unknown,
    { chatId }: { chatId: string },
    context: AppQraphQLContext
): Promise<Chat> => {
    const user = await isAuthenticatedMiddleware(context);
    const chatUUID = types.Uuid.fromString(chatId);

    await isUserAChatMemberMiddleware({
        chatId: chatUUID,
        userId: user.id,
    });

    const chat = await getChat(chatUUID);

    return chat;
};
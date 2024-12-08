import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import type { Chat } from "../chat.types";
import { getChat } from "../service/getChat";
import { getChatName } from "../service/getChatName";
import { getChatAvatar } from "../service/getChatAvatar";
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

    await isUserAChatMemberMiddleware(user.id, chatUUID);

    const chat = await getChat(chatUUID);
    const chatName = await getChatName(chatUUID, user.id);
    const chatAvatar = await getChatAvatar(chatUUID, user.id);

    return {
        id: chat.id,
        name: chatName,
        avatar: chatAvatar,
        owner_id: chat.owner_id,
    };
};
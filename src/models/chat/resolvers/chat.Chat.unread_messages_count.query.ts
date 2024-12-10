import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import { getUserUnreadMessagesByChat } from "../../message/service/getUserUnreadMessagesByChat";
import type { Chat } from "../chat.types";

export const chatUnreadMessagesCountDefs = `
type Query {
    chatUnreadMessagesCount(chatId: ID!): Int!
}
`;

export const chatUnreadMessagesCount = async (
    parent: Chat,
    _: unknown,
    context: AppQraphQLContext
): Promise<number> => {
    const user = await isAuthenticatedMiddleware(context);
    return await getUserUnreadMessagesByChat(user.id, parent.id);
};
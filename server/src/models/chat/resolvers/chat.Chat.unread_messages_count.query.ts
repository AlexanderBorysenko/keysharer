import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import messageDBService from "../../message/service/messageDBService";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
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
    return await messageDBService.getUnreadMessagesCount({
        userId: user.id,
        chatId: parent.id,
    });
};
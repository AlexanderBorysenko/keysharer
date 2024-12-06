import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import type { ChatCard } from "../chat.types";
import { getUserChatCards } from "../service/getUserChatCards";

export const myChatCardsDefs = `
type Query {  
    myChatCards: [ChatCard!]!
}
`;

export const myChatCards = async (_: unknown, __: unknown, context: AppQraphQLContext): Promise<ChatCard[]> => {
    const user = await isAuthenticatedMiddleware(context);

    const result = await getUserChatCards(user.id);

    return result;
};
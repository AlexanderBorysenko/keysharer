import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import { client } from "../../../db/client";
import { types } from "cassandra-driver";
import { isUserAChatMemberMiddleware } from "../service/isUserAChatMemeber";

export const userTypingStatusDefs = `
type Query {
    userTypingStatus(chatId: ID!, isTyping: Boolean!): Boolean!
}
`;

export const userTypingStatus = async (
    _: unknown,
    { chatId, isTyping }: { chatId: string; isTyping: boolean },
    context: AppQraphQLContext
): Promise<boolean> => {
    const user = await isAuthenticatedMiddleware(context);
    await isUserAChatMemberMiddleware(user.id, types.Uuid.fromString(chatId));

    try {
        // publish user typing status event

        return true;
    } catch (error) {
        console.error('Error updating typing status', error);
        return false;
    }
};
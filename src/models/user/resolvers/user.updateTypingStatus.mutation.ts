import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../middleware/isAuthenticatedMiddleware";
import { types } from "cassandra-driver";
import { isUserAChatMemberMiddleware } from "../../chat/service/isUserAChatMemeber";
import { publishTypingStatusUpdated } from "./user.typingStatusUpdated.subscription";

export const updateTypingStatusDefs = `
type Mutation {
    updateTypingStatus(chatId: ID!, isTyping: Boolean!): Boolean!
}
`;

export const updateTypingStatus = async (
    _: unknown,
    { chatId, isTyping }: { chatId: string; isTyping: boolean },
    context: AppQraphQLContext
): Promise<boolean> => {
    const user = await isAuthenticatedMiddleware(context);
    await isUserAChatMemberMiddleware(user.id, types.Uuid.fromString(chatId));

    try {
        publishTypingStatusUpdated({
            userId: user.id,
            chatId: types.Uuid.fromString(chatId),
            isTyping
        });

        return true;
    } catch (error) {
        console.error('Error updating typing status', error);
        return false;
    }
};
import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import type { Chat } from "../chat.types";
import { getChatUsersJoinedAt } from "../service/getChatUsersJoinedAt";
import { isUserAChatMemberMiddleware } from "../service/isUserAChatMemeber";

export type UserJoinedChatAt = {
    userId: string;
    joinedAt: Date;
};

export const chatUsersJoinedAtDefs = `
type UserJoinedChatAt {
    userId: ID!
    joinedAt: String!
}

type Chat {
    usersJoinedAt: [UserJoinedChatAt!]}
`;

export const usersJoinedAt = async (
    chat: Chat,
    _: unknown,
    context: AppQraphQLContext
): Promise<UserJoinedChatAt[]> => {
    const user = await isAuthenticatedMiddleware(context);
    isUserAChatMemberMiddleware({
        chatId: chat.id,
        userId: user.id,
    });

    const usersJoinedAt = await getChatUsersJoinedAt(chat.id);
    return usersJoinedAt.map(user => ({
        userId: user.user_id.toString(),
        joinedAt: user.timestamp,
    }));
};
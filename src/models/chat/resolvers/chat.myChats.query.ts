import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import type { Chat } from "../chat.types";
import { getUserChatsIds } from "../service/getUserChatsIds";
import { client } from "../../../db/client";
import { getChatName } from "../service/getChatName";
import { throwUnexpectedError } from "../../../errors/throwUnexpectedError";

export const myChatsDefs = `
type Query {
    myChats: [Chat!]!
}
`;

export const myChats = async (_: unknown, __: unknown, context: AppQraphQLContext): Promise<Chat[]> => {
    const user = await isAuthenticatedMiddleware(context);

    const chatIds = await getUserChatsIds(user.id);
    if (chatIds.length === 0) return [];

    const chatsQuery = 'SELECT * FROM chats WHERE id IN ?';
    const chatsResult = await client.execute(chatsQuery, [chatIds], { prepare: true });
    const chats = await Promise.all(chatsResult.rows.map(async row => ({
        id: row.id,
        name: await getChatName(row.id, user.id),
        avatar: row.avatar,
        owner_id: row.owner_id,
    })));
    return chats;
};
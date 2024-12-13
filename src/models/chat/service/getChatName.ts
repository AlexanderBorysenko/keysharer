import type { types } from "cassandra-driver";
import { client } from "../../../db/client";
import { getChatUserIds } from "./getChatUserIds";
import type { Chat } from "../chat.types";
import { resolveChat } from "./resolveChat";

export const getChatName = async (chatReference: types.Uuid | Chat | string, excludeUserId: types.Uuid | null = null): Promise<string> => {
    try {
        const chat = await resolveChat(chatReference);
        if (!chat) throw new Error('Chat not found');

        if (chat.name) return chat.name;
        else {
            let userNames: string[] = [];
            const chatUserIds = (await getChatUserIds({
                chatId: chat.id,
                exclude: excludeUserId ? [excludeUserId] : [],
            }));
            const usersQuery = 'SELECT id, display_name, username FROM users WHERE id IN ?';
            const usersResult = await client.execute(usersQuery, [chatUserIds], { prepare: true });
            usersResult.rows.forEach((user) => {
                if (user.display_name) userNames.push(user.display_name);
                else userNames.push(user.username);
            });
            return userNames.join(', ') || chat.id.toString();
        }
    } catch (error) {
        console.error('Error getting chat name', error);
        throw error;
    }
}
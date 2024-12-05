import type { types } from "cassandra-driver";
import { client } from "../../../db/client";
import { getChatUsersIds } from "./getChatUsersIds";

export const getChatName = async (chatId: types.Uuid, excludeUserId: types.Uuid | null = null): Promise<string> => {
    const query = 'SELECT name FROM chats WHERE id = ?';
    const result = await client.execute(query, [chatId], { prepare: true });
    const chat = result.first();
    if (!chat) throw new Error('Chat not found');

    if (chat.get('name')) return chat.get('name');
    else {
        let userNames: string[] = [];
        const chatUserIds = await getChatUsersIds(chatId);
        const usersQuery = 'SELECT id, display_name, username FROM users WHERE id IN ?';
        const usersResult = await client.execute(usersQuery, [chatUserIds], { prepare: true });
        usersResult.rows.forEach((user) => {
            if (user.id === excludeUserId) return;
            if (user.displayName) userNames.push(user.displayName);
            else userNames.push(user.username);
        })

        return userNames.join(', ');
    }
}
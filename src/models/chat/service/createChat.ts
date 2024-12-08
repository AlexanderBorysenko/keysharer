import { client } from "../../../db/client";
import type { Chat } from "../chat.types";
import { types } from "cassandra-driver";

export const createChat = async ({
    ownerId,
    name,
    avatar,
    userIds
}: {
    ownerId: types.Uuid;
    name: string;
    avatar: string;
    userIds: types.Uuid[];
}): Promise<Chat> => {
    // Генерація унікального ідентифікатора для нового чату
    const chatId = types.Uuid.random();

    // Підготовка запитів для пакетного виконання
    const queries = [
        {
            query: 'INSERT INTO chats (id, name, avatar, owner_id) VALUES (?, ?, ?, ?)',
            params: [chatId, name, avatar, ownerId],
        },
    ];

    if (!userIds.map(id => id.toString()).includes(ownerId.toString())) {
        userIds.push(ownerId);
    }
    userIds.forEach((userId) => {
        queries.push({
            query: 'INSERT INTO user_chat (chat_id, user_id) VALUES (?, ?)',
            params: [chatId, userId],
        });
    });

    // Виконання пакетного запиту
    try {
        await client.batch(queries, { prepare: true });

        return {
            id: chatId,
            name,
            avatar,
            owner_id: ownerId,
        };
    } catch (error) {
        throw new Error('Error Creating Chat', {
            cause: error
        });
    }
}

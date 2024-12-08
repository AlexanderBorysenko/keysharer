import type { types } from "cassandra-driver";
import { client } from "../../../db/client";

export const getChat = async (chatId: types.Uuid) => {
    const chatQuery = 'SELECT * FROM chats WHERE id = ?';
    const chatResult = await client.execute(chatQuery, [chatId], { prepare: true });
    const chat = chatResult.first();

    if (!chat) {
        throw new Error(`Chat with id ${chatId} not found.`);
    }

    return chat;
};
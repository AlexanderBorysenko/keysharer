import type { types } from "cassandra-driver";
import { client } from "../../../db/client";
import { rowToObject } from "../../../utils/rowToObject";
import type { Chat } from "../chat.types";

export const getChat = async (chatId: types.Uuid): Promise<Chat> => {
    try {
        const chatQuery = 'SELECT * FROM chats WHERE id = ?';
        const chatResult = await client.execute(chatQuery, [chatId], { prepare: true });
        const chat = chatResult.first();

        if (!chat) throw new Error('Chat not found');
        return rowToObject<Chat>(chat);
    } catch (error) {
        console.error('Error executing getChat query', error);
        throw error;
    }
};

import type { types } from "cassandra-driver";
import { client } from "../../../db/client";
import type { ChatCard } from "../chat.types";
import { getChatCard } from "./getUserChatCard";
import { getUserChatsIds } from "./getUserChatsIds";

export const getUserChatCards = async (userId: types.Uuid): Promise<ChatCard[]> => {
    const chatIds: types.Uuid[] = await getUserChatsIds(userId);

    if (chatIds.length === 0) return [];

    // 2. Отримати інформацію про чати
    const chatsQuery = 'SELECT * FROM chats WHERE id IN ?';
    const chatsResult = await client.execute(chatsQuery, [chatIds], { prepare: true });
    const chats = chatsResult.rows;

    const chatCards: ChatCard[] = [];

    for (const chat of chats) {
        try {
            const chatCard = await getChatCard(chat.id, userId);
            chatCards.push(chatCard);
        } catch (error) {
            console.error('Error getting chat card', error);
        }
    }

    return chatCards;
}

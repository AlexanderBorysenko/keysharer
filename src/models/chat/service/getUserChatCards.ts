import type { types } from "cassandra-driver";
import type { ChatCard } from "../chat.types";
import { getChatCard } from "./getUserChatCard";
import { getUserChats } from "./getUserChats";

export const getUserChatCards = async (userId: types.Uuid): Promise<ChatCard[]> => {
    try {
        const chats = await getUserChats(userId);
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
    } catch (error) {
        console.error('Error getting user chat cards', error);
        throw error;
    }
}

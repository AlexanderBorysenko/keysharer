import type { types } from "cassandra-driver";
import type { ChatCard } from "../chat.types";
import { getChatName } from "./getChatName";
import { getUserUnreadMessagesByChat } from "../../message/service/getUserUnreadMessagesByChat";
import { getChat } from "./getChat";
import { getChatAvatar } from "./getChatAvatar";

export const getChatCard = async (
    chatId: types.Uuid,
    userId: types.Uuid
): Promise<ChatCard> => {
    try {
        const chat = await getChat(chatId);
        const chatName = await getChatName(chatId, userId);
        const chatAvatar = await getChatAvatar(chatId, userId);
        const unreadMessagesCount = userId ? await getUserUnreadMessagesByChat(userId, chatId) : 0;

        return {
            id: chatId,
            name: chatName,
            avatar: chatAvatar,
            unread_messages_count: unreadMessagesCount,
        };
    } catch (error) {
        console.error('Error getting chat card', error);
        throw error;
    }
};
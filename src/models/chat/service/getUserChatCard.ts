import type { types } from "cassandra-driver";
import type { Chat, ChatCard } from "../chat.types";
import { getChatName } from "./getChatName";
import { getUserUnreadMessagesByChat } from "../../message/service/getUserUnreadMessagesByChat";
import { getChatAvatar } from "./getChatAvatar";
import { resolveChat } from "./resolveChat";

export const getChatCard = async (
    chatReference: types.Uuid | Chat,
    userId: types.Uuid
): Promise<ChatCard> => {
    try {
        const chat = await resolveChat(chatReference);
        const chatName = await getChatName(chat, userId);
        const chatAvatar = await getChatAvatar(chat, userId);
        const unreadMessagesCount = userId ? await getUserUnreadMessagesByChat(userId, chat.id) : 0;

        return {
            id: chat.id,
            name: chatName,
            avatar: chatAvatar,
            unread_messages_count: unreadMessagesCount,
        };
    } catch (error) {
        console.error('Error getting chat card', error);
        throw error;
    }
};
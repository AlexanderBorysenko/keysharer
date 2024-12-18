import type { types } from "cassandra-driver";
import { getChatUsers } from "./getChatUsers";
import type { Chat } from "../chat.types";
import { resolveChat } from "./resolveChat";
import { avatarImageStorageService } from "../../../services/avatarImageStorageService";

export const getChatAvatar = async (chat: types.Uuid | Chat, userId: types.Uuid): Promise<string> => {
    try {
        const chatData = await resolveChat(chat);
        if (!chatData) throw new Error('Chat not found');

        let avatar = chatData.avatar || await getDefaultAvatar(chatData.id, userId);
        return avatarImageStorageService.formatAvatarUrl(avatar);
    } catch (error) {
        console.error('Error getting chat avatar', error);
        throw error;
    }
}

const getDefaultAvatar = async (chatId: types.Uuid, userId: types.Uuid): Promise<string | null> => {
    const users = await getChatUsers(chatId, userId);
    return users.length > 0 ? (users[0].avatar || '') : null;
}

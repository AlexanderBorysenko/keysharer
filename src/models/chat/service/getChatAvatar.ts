import type { types } from "cassandra-driver";
import { getChat } from "./getChat"
import { getChatUsers } from "./getChatUsers";

export const getChatAvatar = async (chatId: types.Uuid, userId: types.Uuid) => {
    const chat = await getChat(chatId);

    if (chat.avatar) return chat.avatar;

    else {
        const users = await getChatUsers(chatId, userId);
        return users.length > 0 ? users[0].avatar : null;
    }
}
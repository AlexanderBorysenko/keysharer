import { types } from "cassandra-driver";
import { client } from "../../../db/client";
import type { Chat } from "../chat.types";
import { resolveChat } from "./resolveChat";
import { avatarImageStorageService } from "../../../services/avatarImageStorageService";

export const updateChatAvatar = async (
    chatReference: types.Uuid | Chat,
    file: File
): Promise<void> => {
    try {
        const chat: Chat = await resolveChat(chatReference);

        const {
            fileUrl
        } = await avatarImageStorageService.createAvatarFile(file);

        if (chat.avatar) avatarImageStorageService.deleteAvatarFile(chat.avatar);

        const query = "UPDATE chats SET avatar = ? WHERE id = ?";
        await client.execute(query, [fileUrl, chat.id], { prepare: true });
    }
    catch (error) {
        console.error("Error updating chat avatar", error);
        throw error;
    }
};

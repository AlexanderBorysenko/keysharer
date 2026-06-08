import { client } from "../../../db/client";
import { types } from "cassandra-driver";
import { getChatUserIds } from "./getChatUserIds";
import { throwConflictError } from "../../../errors/throwConflictError";

export const addUserToChat = async ({
    chatId,
    userId,
}: {
    chatId: types.Uuid;
    userId: types.Uuid;
}): Promise<boolean> => {
    // Check if the user to be added is already a member of the chat
    const chatUserIds = await getChatUserIds({ chatId });
    if (chatUserIds.includes(userId)) {
        throwConflictError("User is already a member of the chat");
    }

    // Add the user to the chat
    const query = "INSERT INTO user_chat (chat_id, user_id, timestamp) VALUES (?, ?, toTimestamp(now()))";
    await client.execute(query, [chatId, userId], { prepare: true });

    return true;
};
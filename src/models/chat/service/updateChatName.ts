import { client } from "../../../db/client";
import { types } from "cassandra-driver";
import xss from "xss";
import DOMPurify from "isomorphic-dompurify";

export const updateChatName = async (
    chatId: types.Uuid,
    name: string
): Promise<void> => {
    try {
        name = name.trim();
        name = xss(name);
        name = DOMPurify.sanitize(name);

        const query = "UPDATE chats SET name = ? WHERE id = ?";
        await client.execute(query, [name, chatId], { prepare: true });
    }
    catch (error) {
        console.error("Error updating chat name", error);
        throw error;
    }
};
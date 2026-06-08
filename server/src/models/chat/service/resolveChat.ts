import { types } from "cassandra-driver";
import type { Chat } from "../chat.types";
import { getChat } from "./getChat";

/**
 * Resolves a chat reference to a Chat object.
 *
 * @param chatReference - The chat reference which can be a Chat object, a UUID string, or a UUID instance.
 * @returns A promise that resolves to a Chat object.
 * @throws Will throw an error if the chat reference is invalid.
 */
export const resolveChat = async (chatReference: Chat | types.Uuid | string): Promise<Chat> => {
    if (typeof chatReference === 'string') {
        return await getChat(types.Uuid.fromString(chatReference));
    }

    if (typeof chatReference === 'object' && chatReference.toString() === '[object Object]') {
        return chatReference as Chat;
    }

    if (chatReference instanceof types.Uuid) {
        return await getChat(chatReference as types.Uuid);
    }

    throw new Error('Invalid chat reference');
}
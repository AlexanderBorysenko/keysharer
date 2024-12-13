import { types } from "cassandra-driver";
import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import { isUserAChatMemberMiddleware } from "../service/isUserAChatMemeber";
import { getChat } from "../service/getChat";
import type { Chat } from "../chat.types";
import { updateChatName } from "../service/updateChatName";
import { updateChatAvatar } from "../service/updateChatAvatar";
import { publishChatUpdated } from "./chat.chatUpdated.subscription";

export const updateChatDefs = `
scalar File

input UpdateChatInput {
    id: ID!
    name: String
    avatar: File
}

type Mutation {
    updateChat(input: UpdateChatInput!): Boolean!
}
`;

export const updateChat = async (
    _: unknown,
    { input: { id, name, avatar } }: { input: { id: string; name?: string; avatar?: File } },
    context: AppQraphQLContext
): Promise<boolean> => {
    const user = await isAuthenticatedMiddleware(context);
    const chatUUID = types.Uuid.fromString(id);

    // Check if the user is a member of the chat
    await isUserAChatMemberMiddleware({
        chatId: chatUUID,
        userId: user.id,
    });

    // Update name if provided
    if (name) {
        await updateChatName(chatUUID, name);
    }

    // Update avatar if provided
    if (avatar) {
        try {
            await updateChatAvatar(chatUUID, avatar);
        }
        catch (err) {
            console.error(err);
        }
    }

    await publishChatUpdated(chatUUID);

    return true;
};

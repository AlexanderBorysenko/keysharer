import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { client } from "../../../db/client";
import { getChatUserIds } from "../service/getChatUserIds";
import { publishChatUpdated } from "./chat.chatUpdated.subscription";
import { types } from "cassandra-driver";
import { isUserAChatMemberMiddleware } from "../service/isUserAChatMemeber";
import { isEmailVerifiedMiddleware } from "../../user/middleware/isEmailVerifiedMiddleware";
import { throwConflictError } from "../../../errors/throwConflictError";
import { isUserAChatAdministrator } from "../service/isUserAChatAdministrator";
import { throwForbiddenError } from "../../../errors/throwForbiddenError";
import { publishChatDeleted } from "./chat.deleteChat.subscription";

export type RemoveUserFromChatInput = {
    chatId: string;
    userId: string;
};

export const removeUserFromChatDefs = `
input RemoveUserFromChatInput {
    chatId: ID!
    userId: ID!
}

type Mutation {
    removeUserFromChat(input: RemoveUserFromChatInput!): Boolean!
}
`;

export const removeUserFromChat = async (
    _: any,
    { input: { chatId, userId } }: { input: RemoveUserFromChatInput },
    context: AppQraphQLContext
): Promise<boolean> => {
    const user = await isEmailVerifiedMiddleware(context);

    // Check if the user to be removed is a member of the chat
    await isUserAChatMemberMiddleware({
        chatId: types.Uuid.fromString(chatId),
        userId: types.Uuid.fromString(userId),
    });

    const isAdministratorOfChat = await isUserAChatAdministrator({
        chatReferense: types.Uuid.fromString(chatId),
        userId: user.id,
    })

    // If the user is not removing themselves, or is not an admin, throw an error
    if (user.id.toString() !== userId && !isAdministratorOfChat) {
        throw throwForbiddenError("You are not allowed to remove this user from the chat");
    }
    // TODO: Make more complex checks for removing users from the chat in admin cases
    if (user.id.toString() === userId && isAdministratorOfChat) {
        throw throwForbiddenError("You are not allowed to remove yourself from the chat as the admin");
    }

    // Remove the user from the chat
    const query = "DELETE FROM user_chat WHERE chat_id = ? AND user_id = ?";
    await client.execute(query, [chatId, userId], { prepare: true });

    // Publish chat updated event
    await publishChatUpdated(types.Uuid.fromString(chatId));
    await publishChatDeleted([types.Uuid.fromString(userId)], types.Uuid.fromString(chatId));

    return true;
};
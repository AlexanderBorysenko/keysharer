import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { throwUnexpectedError } from "../../../errors/throwUnexpectedError";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import type { Chat } from "../chat.types";
import { createChat, type CreateChatInput } from "../service/createChat";
import { publishMyChatCardsUpdate } from "./chat.myChatCardsUpdate.subscription";


export const createUserChatInputTypeDef = `
input CreateChatInput {
  name: String!
  avatar: String
  userIds: [ID!]!
}`;

export const createUserChatMutationDef = `createUserChat(input: CreateChatInput!): Chat!`;

export const createUserChatMutation = async (
    parent: any,
    { input }: { input: CreateChatInput },
    context: AppQraphQLContext
): Promise<Chat> => {
    const user = await isAuthenticatedMiddleware(context);

    try {
        const chat = await createChat({
            ownerId: user.id,
            name: input.name,
            avatar: input.avatar,
            userIds: input.userIds.map((id) => id),
        });

        publishMyChatCardsUpdate(user.id);

        return chat;
    } catch (error) {
        console.error(error);
        return throwUnexpectedError('Error creating chat');
    }
};
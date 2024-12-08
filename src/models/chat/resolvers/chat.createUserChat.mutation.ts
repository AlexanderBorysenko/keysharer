import { types } from "cassandra-driver";
import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { throwUnexpectedError } from "../../../errors/throwUnexpectedError";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import type { Chat } from "../chat.types";
import { createChat } from "../service/createChat";
import { publishMyChatCardsUpdate } from "./chat.myChatCardsUpdate.subscription";
import { publishChatCreated } from "./chat.createChat.subscription";

export type CreateChatInput = {
    name: string;
    avatar: string;
    userIds: types.Uuid[];
};

export const createUserChatDefs = `
input CreateChatInput {
    name: String
    avatar: String
    userIds: [ID!]!
}
type Mutation {
    createUserChat(input: CreateChatInput!): Chat!
}
`;

export const createUserChat = async (
    parent: any,
    { input: { name, avatar, userIds } }: { input: CreateChatInput },
    context: AppQraphQLContext
): Promise<Chat> => {
    const user = await isAuthenticatedMiddleware(context);

    if (userIds.map(id => id.toString()).includes(user.id.toString())) {
        return throwUnexpectedError("You can't create a chat without yourself");
    }

    try {
        const chat = await createChat({
            ownerId: user.id,
            name: name,
            avatar: avatar,
            userIds: userIds.map((id) => id),
        });

        publishChatCreated(chat.id, user.id);

        return chat;
    } catch (error) {
        console.error(error);
        return throwUnexpectedError("Error creating chat");
    }
};

import type { types } from "cassandra-driver";
import { getChat } from "./getChat";
import { GraphQLError } from 'graphql';
import type { Chat } from "../chat.types";
import { resolveChat } from "./resolveChat";


export const isUserAChatAdministrator = async ({
    userId,
    chatReferense,
}: {
    userId: types.Uuid,
    chatReferense: Chat | types.Uuid,
}) => {
    const chat = await resolveChat(chatReferense);
    if (!chat) return false;
    if (chat.owner_id.toString() !== userId.toString()) {
        return false;
    }
    return true;
};

export const isUserAChatAdministratorMiddleware = async ({
    userId,
    chatReferense,
}: {
    userId: types.Uuid,
    chatReferense: Chat | types.Uuid,
}) => {
    const isAdministrator = await isUserAChatAdministrator({
        userId,
        chatReferense,
    });
    if (!isAdministrator) {
        throw new GraphQLError('You are not an administrator of this chat', {
            extensions: {},
        });
    }

    return true;
};
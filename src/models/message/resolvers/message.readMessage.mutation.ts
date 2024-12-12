import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import { client } from "../../../db/client";
import { types } from "cassandra-driver";
import { isUserAChatMemberMiddleware } from "../../chat/service/isUserAChatMemeber";
import messageDBService from "../service/messageDBService";

export type ReadMessageInput = {
    chatId: types.Uuid;
    messageId: types.TimeUuid;
};

export const readMessageDefs = `
type Mutation {
    readMessage(messageId: ID!): Boolean!
}
`;

export const readMessageMutation = async (
    _: any,
    { messageId }: { messageId: types.TimeUuid },
    context: AppQraphQLContext
): Promise<boolean> => {
    const user = await isAuthenticatedMiddleware(context);
    const message = await messageDBService.getMessage({ messageId });
    await isUserAChatMemberMiddleware({
        chatId: message.chat_id,
        userId: user.id,
    });

    try {
        await messageDBService.readMessage({
            chatId: message.chat_id,
            messageId,
            userId: user.id,
        })

        return true;
    } catch (error) {
        console.error(error as any);
        throw error;
    }
};
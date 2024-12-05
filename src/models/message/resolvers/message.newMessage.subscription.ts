import type { types } from "cassandra-driver";
import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { pubsub } from "../../../graphql/pubSub";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import type { TMessage } from "../message.types";
import { isUserAChatMemberMiddleware } from "../../chat/service/isUserAChatMemeber";

export const newMessageSubscriptionDef = `newMessage(chatId: ID!): Message!`;

export const newMessageSubscription = {
    subscribe: async (_: unknown, { chatId }: { chatId: types.Uuid }, context: AppQraphQLContext) => {
        const user = await isAuthenticatedMiddleware(context);
        await isUserAChatMemberMiddleware(user.id, chatId);

        return pubsub.subscribe(`NEW_MESSAGE_${chatId}`);
    },
    resolve: (payload: TMessage) => {
        return payload;
    }
};

export const publishMessageSent = async (chatId: types.Uuid, message: TMessage) => {
    pubsub.publish(`NEW_MESSAGE_${chatId.toString()}`, message);
};
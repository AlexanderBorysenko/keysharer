import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { pubsub } from "../../../graphql/pubSub";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import { getChat } from "../service/getChat";
import type { types } from "cassandra-driver";
import { isUserAChatMemberMiddleware } from "../service/isUserAChatMemeber";
import type { Chat } from "../chat.types";
import { getChatUserIds } from "../service/getChatUserIds";

export const chatUpdatedSubscriptionDefs = `
type Subscription {
    chatUpdated: Chat!
}
`;

export const chatUpdatedSubscription = {
    subscribe: async (_: unknown, __: unknown, context: AppQraphQLContext) => {
        const user = await isAuthenticatedMiddleware(context);
        return pubsub.subscribe(`CHAT_UPDATED_${user.id.toString()}`);
    },
    resolve: async (payload: { chatUpdated: Chat }) => {
        return payload.chatUpdated;
    }
};

export const publishChatUpdated = async (chatId: types.Uuid) => {
    const chat = await getChat(chatId);
    const chatUsers = await getChatUserIds(chatId);
    chatUsers.forEach((userId) => {
        pubsub.publish(`CHAT_UPDATED_${userId.toString()}`, { chatUpdated: chat });
    });
};
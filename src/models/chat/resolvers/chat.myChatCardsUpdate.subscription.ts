import type { types } from "cassandra-driver";
import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { pubsub } from "../../../graphql/pubSub";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import type { ChatCard } from "../chat.types";
import { getUserChatCards } from "../service/getUserChatCards";

export const myChatCardsSubscriptionDefs = `
type Subscription {
    myChatCards: [ChatCard]!
}    
`;
export const myChatCardsSubscription = {
    subscribe: async (_: unknown, __: unknown, context: AppQraphQLContext) => {
        const user = await isAuthenticatedMiddleware(context);

        setTimeout(() => {
            publishMyChatCardsUpdate(user.id);
        }, 0);

        return pubsub.subscribe(`USER_CHATS_UPDATED_${user.id}`);
    },
    resolve: (payload: ChatCard[]) => {
        if (Array.isArray(payload)) return payload;
        return [];
    }
};

export const publishMyChatCardsUpdate = async (userId: types.Uuid) => {
    const currentChatCards = await getUserChatCards(userId);
    pubsub.publish(`USER_CHATS_UPDATED_${userId.toString()}`, currentChatCards);
}
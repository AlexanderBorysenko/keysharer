import type { types } from "cassandra-driver";
import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { pubsub } from "../../../graphql/pubSub";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import type { TMessage } from "../message.types";
import { isUserAChatMemberMiddleware } from "../../chat/service/isUserAChatMemeber";
import { getChatUsersIds } from "../../chat/service/getChatUsersIds";

export const newMessageSubscriptionDefs = `
type Subscription {
    newMessage: Message!
}
`;

export const newMessageSubscription = {
    subscribe: async (_: unknown, __: unknown, context: AppQraphQLContext) => {
        const user = await isAuthenticatedMiddleware(context);

        return pubsub.subscribe(`NEW_MESSAGE_${user.id.toString()}`);
    },
    resolve: (payload: TMessage) => {
        return payload;
    }
};

export const publishMessageSent = async (message: TMessage) => {
    const chatUsersIds = await getChatUsersIds(message.chat_id);
    chatUsersIds.forEach((userId) => {
        pubsub.publish(`NEW_MESSAGE_${userId.toString()}`, message);
    });
};
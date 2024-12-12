import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { pubsub } from "../../../graphql/pubSub";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import { getChatUserIds } from "../service/getChatUserIds";
import type { types } from "cassandra-driver";

export const deleteChatSubscriptionDefs = `
type Subscription {
    chatDeleted: ID!
}
`;

export const deleteChatSubscription = {
	subscribe: async (_: unknown, __: unknown, context: AppQraphQLContext) => {
		const user = await isAuthenticatedMiddleware(context);
		return pubsub.subscribe(`CHAT_DELETED_${user.id}`);
	},
	resolve: (payload: { chatId: types.Uuid }) => {
		return payload.chatId;
	},
};

export const publishChatDeleted = async (userIds: types.Uuid[], chatId: types.Uuid) => {
	userIds.forEach((userId) => {
		pubsub.publish(`CHAT_DELETED_${userId.toString()}`, { chatId });
	});
};

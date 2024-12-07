import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { pubsub } from "../../../graphql/pubSub";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import { getChatUsersIds } from "../service/getChatUsersIds";
import { getChatCard } from "../service/getUserChatCard";
import type { types } from "cassandra-driver";
import type { ChatCard } from "../chat.types";

export const createChatSubscriptionDefs = `
type Subscription {
	chatCreated: ChatCard!
}
`;

export const createChatSubscription = {
	subscribe: async (_: unknown, __: unknown, context: AppQraphQLContext) => {
		const user = await isAuthenticatedMiddleware(context);
		return pubsub.subscribe(`CHAT_CREATED_${user.id}`);
	},
	resolve: (payload: ChatCard) => {
		return payload;
	},
};

export const publishChatCreated = async (chatId: types.Uuid) => {
	const chatUsers = await getChatUsersIds(chatId);
	const chatCard = await getChatCard(chatId);

	chatUsers.forEach((userId) => {
		pubsub.publish(`CHAT_CREATED_${userId.toString()}`, chatCard);
	});
};

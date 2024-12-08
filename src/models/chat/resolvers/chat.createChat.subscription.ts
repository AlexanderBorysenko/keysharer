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
		console.log(`Subscribed To CHAT_CREATED_${user.id.toString()}`)
		return pubsub.subscribe(`CHAT_CREATED_${user.id.toString()}`);
	},
	resolve: (payload: ChatCard) => {
		return payload;
	},
	onDisconnect: async (context: AppQraphQLContext) => {
		const user = await isAuthenticatedMiddleware(context);
		console.log(`Unsubscribed From CHAT_CREATED_${user.id.toString()}`);
		// Handle any additional cleanup if necessary
	},
};

export const publishChatCreated = async (chatId: types.Uuid, userId: types.Uuid) => {
	const chatUsers = await getChatUsersIds(chatId);
	const chatCard = await getChatCard(chatId, userId);

	chatUsers.forEach((userId) => {
		pubsub.publish(`CHAT_CREATED_${userId.toString()}`, chatCard);
	});
};

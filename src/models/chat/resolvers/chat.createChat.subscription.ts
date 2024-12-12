import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { pubsub } from "../../../graphql/pubSub";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import { getChatUserIds } from "../service/getChatUserIds";
import type { types } from "cassandra-driver";
import type { Chat } from "../chat.types";
import { resolveChat } from "../service/resolveChat";

export const createChatSubscriptionDefs = `
type Subscription {
	chatCreated: Chat!
}
`;

export const createChatSubscription = {
	subscribe: async (_: unknown, __: unknown, context: AppQraphQLContext) => {
		try {
			const user = await isAuthenticatedMiddleware(context);
			return pubsub.subscribe(`CHAT_CREATED_${user.id.toString()}`);
		} catch (err) {
			console.error(err);
		}
	},
	resolve: (payload: Chat) => {
		return payload;
	},
};

export const publishChatCreated = async (chatReference: types.Uuid | Chat) => {
	const chat = await resolveChat(chatReference);
	const chatUsers = await getChatUserIds(chat.id);

	chatUsers.forEach((userId) => {
		pubsub.publish(`CHAT_CREATED_${userId.toString()}`, chat);
	});
};

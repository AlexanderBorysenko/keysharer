import {
	createUserChat,
	createUserChatDefs,
} from "./resolvers/chat.createUserChat.mutation";
import {
	myChatCards,
	myChatCardsDefs,
} from "./resolvers/chat.myChatCards.query";
import { chatUsers } from "./resolvers/chat.Chat.users.query";
import { chatName } from "./resolvers/chat.Chat.name.query";
import {
	deleteUserChat,
	deleteUserChatDefs,
} from "./resolvers/chat.deleteUserChat.mutation";
import { chatMessages } from "./resolvers/chat.Chat.messages.query";
import { myChats, myChatsDefs } from "./resolvers/chat.myChats.query";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { chatCoreDefs } from "./chat.types";
import {
	createChatSubscription,
	createChatSubscriptionDefs,
} from "./resolvers/chat.createChat.subscription";
import {
	deleteChatSubscription,
	deleteChatSubscriptionDefs,
} from "./resolvers/chat.deleteChat.subscription";

export const chatResolvers = {
	Query: {
		myChatCards,
		myChats,
	},
	Mutation: {
		createUserChat,
		deleteUserChat,
	},
	Subscription: {
		chatCreated: createChatSubscription,
		chatDeleted: deleteChatSubscription,
	},
	Chat: {
		users: chatUsers,
		name: chatName,
		messages: chatMessages,
	},
};

export const chatDefs = mergeTypeDefs([
	chatCoreDefs,
	myChatCardsDefs,
	myChatsDefs,
	createUserChatDefs,
	deleteUserChatDefs,

	createChatSubscriptionDefs,
	deleteChatSubscriptionDefs,
]);

import {
	createUserChat,
	createUserChatDefs,
} from "./resolvers/chat.createUserChat.mutation";
import { chatUsers } from "./resolvers/chat.Chat.users.query";
import { chatName } from "./resolvers/chat.Chat.name.query";
import {
	deleteChat,
	deleteChatDefs,
} from "./resolvers/chat.deleteChat.mutation";
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
import { myChat, myChatDefs } from "./resolvers/chat.myChat.query";
import { updateChat, updateChatDefs } from "./resolvers/chat.updateChat.query";
import {
	chatUpdatedSubscription,
	chatUpdatedSubscriptionDefs,
} from "./resolvers/chat.chatUpdated.subscription";
import { chatAvatar } from "./resolvers/chat.Chat.avatar.query";
import { chatUnreadMessagesCount } from "./resolvers/chat.Chat.unread_messages_count.query";
import {
	addUserToChat,
	addUserToChatDefs,
} from "./resolvers/chat.addUserToChat.mutation";
import { chatIAmAdmin } from "./resolvers/chat.Chat.iAmAdmin.query";
import { removeUserFromChat, removeUserFromChatDefs } from "./resolvers/chat.removeUserFromChat.mutation";

export const chatResolvers = {
	Query: {
		myChats,
		myChat,
	},
	Mutation: {
		createUserChat,
		deleteChat,
		updateChat,
		addUserToChat,
		removeUserFromChat,
	},
	Subscription: {
		chatCreated: createChatSubscription,
		chatDeleted: deleteChatSubscription,
		chatUpdated: chatUpdatedSubscription,
	},
	Chat: {
		users: chatUsers,
		name: chatName,
		messages: chatMessages,
		avatar: chatAvatar,
		unread_messages_count: chatUnreadMessagesCount,
		iAmAdmin: chatIAmAdmin
	},
};

export const chatDefs = mergeTypeDefs([
	chatCoreDefs,
	myChatsDefs,
	myChatDefs,

	createUserChatDefs,
	deleteChatDefs,
	updateChatDefs,
	addUserToChatDefs,
	removeUserFromChatDefs,

	chatUpdatedSubscriptionDefs,
	createChatSubscriptionDefs,
	deleteChatSubscriptionDefs,
]);

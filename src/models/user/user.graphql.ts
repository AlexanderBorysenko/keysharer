import {
	createUser,
	createUserDefs,
} from "./resolvers/user.createUser.mutation";
import {
	createGuestUser,
	createGuestUserDefs,
} from "./resolvers/user.createGuestUser.mutation";
import { loginUser, loginUserDefs } from "./resolvers/user.loginUser.mutation";
import { usersQuery, usersQueryDefs } from "./resolvers/user.users.query";
import { meQuery, meQueryDefs } from "./resolvers/user.me.query";
import { userCoreDefs } from "./user.types";
import { mergeTypeDefs } from "@graphql-tools/merge";
import {
	updateTypingStatus,
	updateTypingStatusDefs,
} from "./resolvers/user.updateTypingStatus.mutation";
import {
	typingStatusUpdated,
	typingStatusUpdatedDefs,
} from "./resolvers/user.typingStatusUpdated.subscription";
import {
	sendEmailVerificationDefs,
	sendEmailVerification,
} from "./resolvers/user.sendEmailVerification.mutation";
import {
	verifyEmail,
	verifyEmailDefs,
} from "./resolvers/user.verifyEmail.mutation";
import userDisplayNameResolver from "./resolvers/user.User.displayName";
import { onlineStatusChangedDefs, onlineStatusChangedSubscription } from "./resolvers/user.onlineStatusChanged.subscription";
import { isOnline } from "./resolvers/user.User.isOnline.query";

export const userResolvers = {
	Query: {
		users: usersQuery,
		me: meQuery,
	},
	Mutation: {
		createUser,
		createGuestUser,
		loginUser,
		updateTypingStatus,
		sendEmailVerification,
		verifyEmail,
	},
	Subscription: {
		typingStatusUpdated,
		onlineStatusChanged: onlineStatusChangedSubscription
	},
	User: {
		displayName: userDisplayNameResolver,
		isOnline
	}
};

export const userDefs = mergeTypeDefs([
	userCoreDefs,
	usersQueryDefs,
	meQueryDefs,

	createUserDefs,
	createGuestUserDefs,
	loginUserDefs,
	updateTypingStatusDefs,
	sendEmailVerificationDefs,
	verifyEmailDefs,

	typingStatusUpdatedDefs,
	onlineStatusChangedDefs,
]);

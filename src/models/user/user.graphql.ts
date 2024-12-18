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
import { updateUser, updateUserDefs } from "./resolvers/user.updateUser.mutation";
import { userUpdatedSubscription, userUpdatedSubscriptionDefs } from "./resolvers/user.userUpdated.subscription";
import userAvatarResolver from "./resolvers/user.User.avatar";

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
		updateUser
	},
	Subscription: {
		typingStatusUpdated,
		onlineStatusChanged: onlineStatusChangedSubscription,
		userUpdated: userUpdatedSubscription
	},
	User: {
		displayName: userDisplayNameResolver,
		isOnline,
		avatar: userAvatarResolver
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
	updateUserDefs,

	typingStatusUpdatedDefs,
	onlineStatusChangedDefs,
	userUpdatedSubscriptionDefs
]);

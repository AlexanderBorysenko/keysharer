import { createUser, createUserDefs } from './resolvers/user.createUser.mutation';
import { createGuestUser, createGuestUserDefs } from './resolvers/user.createGuestUser.mutation';
import { loginUser, loginUserDefs } from './resolvers/user.loginUser.mutation';
import { usersQuery, usersQueryDefs } from './resolvers/user.users.query';
import { meQuery, meQueryDefs } from './resolvers/user.me.query';
import { userCoreDefs } from './user.types';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { updateTypingStatus, updateTypingStatusDefs } from './resolvers/user.updateTypingStatus.mutation';
import { typingStatusUpdated, typingStatusUpdatedDefs } from './resolvers/user.typingStatusUpdated.subscription';

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
  },
  Subscription: {
    typingStatusUpdated,
  }
};

export const userDefs = mergeTypeDefs([userCoreDefs,
  usersQueryDefs,
  meQueryDefs,

  createUserDefs,
  createGuestUserDefs,
  loginUserDefs,
  updateTypingStatusDefs,

  typingStatusUpdatedDefs
]);
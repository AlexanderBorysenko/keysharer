import { createUser, createUserDefs } from './resolvers/user.createUser.mutation';
import { createGuestUser, createGuestUserDefs } from './resolvers/user.createGuestUser.mutation';
import { loginUser, loginUserDefs } from './resolvers/user.loginUser.mutation';
import { usersQuery, usersQueryDefs } from './resolvers/user.users.query';
import { meQuery, meQueryDefs } from './resolvers/user.me.query';
import { userCoreDefs } from './user.types';
import { mergeTypeDefs } from '@graphql-tools/merge';

export const userResolvers = {
  Query: {
    users: usersQuery,
    me: meQuery,
  },
  Mutation: {
    createUser,
    createGuestUser,
    loginUser,
  },
};

export const userDefs = mergeTypeDefs([userCoreDefs,
  usersQueryDefs,
  createUserDefs,
  createGuestUserDefs,
  loginUserDefs,
  meQueryDefs
]);
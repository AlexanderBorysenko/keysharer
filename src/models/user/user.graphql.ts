import { createUser, createUserMutationDef } from './resolvers/user.createUser.mutation';
import { createGuestUser, createGuestUserMutationDef } from './resolvers/user.createGuestUser.mutation';
import { loginUser, loginUserMutationDef } from './resolvers/user.loginUser.mutation';
import { usersQuery, usersQueryDef } from './resolvers/user.users.query';
import { meQuery, meQueryDef } from './resolvers/user.me.query';
import { userTypeDef } from './user.types';

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

export const userDefs = `
  ${userTypeDef}

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    ${usersQueryDef}
    ${meQueryDef}
  }

  type Mutation {
    ${createUserMutationDef}
    ${createGuestUserMutationDef}
    ${loginUserMutationDef}
  }
`;
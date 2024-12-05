import type { types } from "cassandra-driver";
import type { Chat } from "../chat/chat.types";

export interface User {
  id: types.Uuid;
  username?: string;
  displayName?: string;
  avatar?: string;
  email?: string;
  emailVerified?: boolean;
  password?: string;
  chats?: Chat[];
}

export const userTypeDef = `
  type User {
    id: ID!
    username: String
    displayName: String
    avatar: String
    email: String
    emailVerified: Boolean
    chats: [Chat]!
  }
`;
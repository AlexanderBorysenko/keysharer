import type { Message } from "yup";
import type { User } from "../user/user.types";
import type { types } from "cassandra-driver";

export interface Chat {
  id: types.Uuid;
  name: string;
  avatar: string;
  owner_id: types.Uuid;

  users?: User[];
  messages?: Message[];
}

export const chatTypeDef = `
  type Chat {
    id: ID!
    name: String!
    avatar: String!
    users: [User!]
    messages(lastMessageId: ID): [Message!]
  }
`;

export interface ChatCard {
  id: types.Uuid;
  name: string;
  avatar: string;
  unread_messages_count: number;
}

export const chatCardTypeDef = `
  type ChatCard {
    id: ID!
    name: String!
    avatar: String!
    unread_messages_count: Int!
  }
`;
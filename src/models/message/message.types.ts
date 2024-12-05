import type { types } from "cassandra-driver";
import type { Chat } from "../chat/chat.types";
import type { User } from "../user/user.types";

export type TMessage = {
  id: types.TimeUuid;
  chat_id: types.Uuid;
  user_id: types.Uuid;
  type: string;
  content: string;
  status: string;
  timestamp: Date;
  user?: User;
  chat?: Chat;
};

export const messageTypeDef = `
  type Message {
    id: ID!
    chat_id: ID!
    user_id: ID!
    type: String!
    content: String!
    status: String!
    timestamp: String!
    user: User!
    chat: Chat!
  }
`;
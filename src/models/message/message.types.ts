import type { types } from "cassandra-driver";
import type { Chat } from "../chat/chat.types";
import type { User } from "../user/user.types";

export type TMessage = {
  id: types.TimeUuid;
  chat_id: types.Uuid;
  user_id: types.Uuid;
  type: string;
  content: string;
  timestamp: Date;
  is_read?: boolean;
  disable_encryption: boolean;
  user?: User;
  chat?: Chat;
};

export type TMessageFile = {
  id: types.Uuid;
  message_id: types.Uuid;
  chat_id: types.Uuid;
  file_name: string;
  file_size: number;
  file_type: string;
  upload_timestamp?: Date;
}

export const messageCoreDefs = `
  type MessageFile {
    id: ID
    message_id: ID
    chat_id: ID
    file_name: String!
    file_size: Int!
    file_type: String!
    file_url: String
    upload_timestamp: String
  }
  type Message {
    id: ID!
    chat_id: ID!
    user_id: ID!
    type: String!
    is_read: Boolean
    content: String!
    timestamp: String!
    disable_encryption: Boolean!
    files: [MessageFile!]
  }
`;
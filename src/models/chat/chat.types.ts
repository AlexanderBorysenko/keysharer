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

export const chatCoreDefs = `
  scalar Int

  type Chat {
    id: ID!
    name: String!
    avatar: String
    owner_id: ID!

    unread_messages_count: Int

    users: [User!]
    messages(lastMessageId: ID): [Message!]
  }
`;
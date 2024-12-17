import type { types } from "cassandra-driver";
import type { Chat } from "../chat/chat.types";

export enum Role {
	USER = "USER",
	GUEST = "GUEST",
}

export interface User {
	id: types.Uuid;
	username: string;
	displayName?: string;
	avatar?: string;
	email?: string;
	emailVerified?: boolean;
	role: Role;
	password?: string;
	chats?: Chat[];
}

export interface EmailVerificationCode {
	userId: types.Uuid;
	code: string;
	expiresAt: Date;
	issuedAt: Date;
}

export const userCoreDefs = `
  type AuthPayload {
    token: String!
    user: User!
  }

  enum Role {
    USER
    GUEST
  }

  type User {
    id: ID!
    username: String!
    displayName: String
    avatar: String
    email: String
    emailVerified: Boolean
    role: Role!
    chats: [Chat!]
    isOnline: Boolean
  }
`;

import { types } from "cassandra-driver";
import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { throwUnexpectedError } from "../../../errors/throwUnexpectedError";
import type { Chat } from "../chat.types";
import { createChat } from "../service/createChat";
import { publishChatCreated } from "./chat.createChat.subscription";
import { isNotGuestMiddleware } from "../../user/middleware/isNotGuestMiddleware";
import type { User } from "../../user/user.types";
import { isEmailVerifiedMiddleware } from "../../user/middleware/isEmailVerifiedMiddleware";

export type CreateChatInput = {
	name: string;
	avatar: string;
	userIds: types.Uuid[];
};

export const createUserChatDefs = `
input CreateChatInput {
    name: String
    avatar: String
    userIds: [ID!]!
}
type Mutation {
    createUserChat(input: CreateChatInput!): Chat!
}
`;

export const createUserChat = async (
	_: any,
	{ input: { name, avatar, userIds } }: { input: CreateChatInput },
	context: AppQraphQLContext
): Promise<Chat> => {
	const user: User = await isEmailVerifiedMiddleware(context);

	if (userIds.map((id) => id.toString()).includes(user.id.toString())) {
		return throwUnexpectedError("You can't create a chat without yourself");
	}

	try {
		const chat = await createChat({
			ownerId: user.id,
			name: name,
			avatar: avatar,
			userIds: userIds.map((id) => id),
		});

		await publishChatCreated({
			chatReference: chat
		});

		return chat;
	} catch (error) {
		console.error(error);
		return throwUnexpectedError("Error creating chat");
	}
};

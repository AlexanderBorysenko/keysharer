import type { types } from "cassandra-driver";
import { getChatUsersIds } from "./getChatUsersIds";
import { throwUnauthenticatedError } from "../../../errors/throwUnauthenticatedError";

export const isUserAChatMemberMiddleware = async (
	userId: types.Uuid,
	chatId: types.Uuid
) => {
	const userIds = await getChatUsersIds(chatId);
	if (!userIds.map((id) => id.toString()).includes(userId.toString())) {
		return throwUnauthenticatedError("You are not a member of this chat");
	}
};

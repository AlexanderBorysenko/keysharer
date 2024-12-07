import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { client } from "../../../db/client";
import { throwUnauthenticatedError } from "../../../errors/throwUnauthenticatedError";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import type { Chat } from "../chat.types";
import { getChatUsersIds } from "../service/getChatUsersIds";

export const chatUsers = async (chat: Chat, {}, context: AppQraphQLContext) => {
	const authUser = await isAuthenticatedMiddleware(context);

	const userIds = (await getChatUsersIds(chat.id)).map((id) => id.toString());
	if (!userIds.includes(authUser.id.toString())) {
		return throwUnauthenticatedError("You are not a member of this chat");
	}

	const usersQuery = "SELECT * FROM users WHERE id IN ?";
	const usersResult = await client.execute(usersQuery, [userIds], {
		prepare: true,
	});

	const users = usersResult.rows.map((row) => ({
		id: row.id,
		username: row.username,
		displayName: row.display_name,
		avatar: row.avatar,
		email: row.email,
		emailVerified: row.email_verified,
	}));

	return users;
};

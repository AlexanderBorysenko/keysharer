import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { client } from "../../../db/client";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import type { Chat } from "../chat.types";
import { getChatUserIds } from "../service/getChatUserIds";
import { isUserAChatMemberMiddleware } from "../service/isUserAChatMemeber";

export const chatUsers = async (chat: Chat, { }, context: AppQraphQLContext) => {
	const authUser = await isAuthenticatedMiddleware(context);

	const userIds = await getChatUserIds({
		chatId: chat.id,
	});
	isUserAChatMemberMiddleware({
		chatId: chat.id,
		userId: authUser.id,
	});

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

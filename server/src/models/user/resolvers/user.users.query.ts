import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { client } from "../../../db/client";
import { isAuthenticatedMiddleware } from "../middleware/isAuthenticatedMiddleware";

export type UserQueryInput = {
	search?: string;
	excludeUserIds?: string[];
};

export const usersQueryDefs = `
input UserQueryInput {
    search: String
	excludeUserIds: [ID!]
}

type Query {
    users (input: UserQueryInput): [User!]!
}
`;
export const usersQuery = async (
	_: any,
	{ input,
	}: { input: UserQueryInput },
	context: AppQraphQLContext
) => {
	const user = await isAuthenticatedMiddleware(context);
	if (input?.search) {
		const excludeUserIds = [...(input.excludeUserIds || []), user.id];
		return (
			await client.execute(
				"SELECT * FROM users WHERE username LIKE ? LIMIT 10",
				[`%${input.search}%`],
				{ prepare: true }
			)
		).rows.filter((row) => !excludeUserIds.includes(row.id.toString()));
	} else {
		return (
			await client.execute("SELECT * FROM users LIMIT 10", [], { prepare: true })
		).rows;
	}
};

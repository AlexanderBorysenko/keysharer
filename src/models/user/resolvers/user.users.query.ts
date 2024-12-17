import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { client } from "../../../db/client";
import { isAuthenticatedMiddleware } from "../middleware/isAuthenticatedMiddleware";

export type UserQueryInput = {
	search?: string;
};

export const usersQueryDefs = `
input UserQueryInput {
    search: String
}

type Query {
    users (input: UserQueryInput): [User!]!
}
`;
export const usersQuery = async (
	_: any,
	{ input }: { input: UserQueryInput },
	context: AppQraphQLContext
) => {
	if (input?.search) {
		const user = await isAuthenticatedMiddleware(context);
		return (
			await client.execute(
				"SELECT * FROM users WHERE username LIKE ? LIMIT 10",
				[`%${input.search}%`],
				{ prepare: true }
			)
		).rows.filter((row) => row.id.toString() !== user.id.toString());
	} else {
		return (
			await client.execute("SELECT * FROM users", [], { prepare: true })
		).rows;
	}
};

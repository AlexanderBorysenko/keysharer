import { types } from "cassandra-driver";
import type { User } from "../user.types";

export const mapRowIntoUser = (row: types.Row): User => {
	return {
		id: row.get("id"),
		username: row.get("username"),
		displayName: row.get("display_name"),
		avatar: row.get("avatar"),
		email: row.get("email"),
		emailVerified: row.get("email_verified"),
		role: row.get("role"),
		password: row.get("password"),
	};
};

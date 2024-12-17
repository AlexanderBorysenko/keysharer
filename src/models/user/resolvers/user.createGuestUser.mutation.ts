import { client } from "../../../db/client";
import { findUser } from "../service/findUser";
import { throwUnexpectedError } from "../../../errors/throwUnexpectedError";
import { createGuestJWTToken } from "../service/createJWTToken";
import { generateUniqueUsername } from "../service/generateUniqueUsername";
import { types } from "cassandra-driver";
import { Role } from "../user.types";

export const createGuestUserDefs = `
type Mutation {
    createGuestUser: AuthPayload!
}    
`;
export const createGuestUser = async () => {
	const username = await generateUniqueUsername();

	const id = types.Uuid.random();

	const query = `INSERT INTO users (id, username, role) VALUES (?, ?, ?)`;
	await client.execute(query, [id, username, Role.GUEST], { prepare: true });

	const user = await findUser({ id });
	if (!user) return throwUnexpectedError("User not found");

	const token = createGuestJWTToken(user);
	return {
		token,
		user,
	};
};

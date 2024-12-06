import { client } from "../../../db/client";
import { findUser } from "../service/findUser";
import { throwUnexpectedError } from "../../../errors/throwUnexpectedError";
import { createJWTToken } from "../service/createJWTToken";
import { generateUniqueUsername } from "../service/generateUniqueUsername";
import { types } from "cassandra-driver";

export const createGuestUserDefs = `
type Mutation {
    createGuestUser: AuthPayload!
}    
`;
export const createGuestUser = async () => {
    const username = await generateUniqueUsername();

    const id = types.Uuid.random();

    const query = `INSERT INTO users (id, username) VALUES (?, ?)`;
    await client.execute(query, [id, username], { prepare: true });

    const user = await findUser({ id });
    if (!user) return throwUnexpectedError('User not found');

    const token = createJWTToken(user);
    return {
        token,
        user,
    };
}
import { client } from "../../../db/client";

export const usersQueryDefs = `
type Query {
    users: [User!]!
}
`;
export const usersQuery = async () => {
    const result = await client.execute('SELECT * FROM users', [], { prepare: true });

    return result.rows;
};
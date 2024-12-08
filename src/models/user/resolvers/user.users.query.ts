import { client } from "../../../db/client";

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
    { input }: { input: UserQueryInput }

) => {
    if (input?.search) {
        return (await client.execute(
            'SELECT * FROM users WHERE username LIKE ? LIMIT 10',
            [`%${input.search}%`],
            { prepare: true }
        )).rows;
    } else {
        return (await client.execute('SELECT * FROM users', [], { prepare: true })).rows;
    }
};
import type { types } from "cassandra-driver";
import { client } from "../../../db/client";
import type { User } from "../user.types";
import { mapRowIntoUser } from "./mapRowIntoUser";

export const findUser = async ({ id, username, raw }: { id?: types.Uuid; username?: string, raw?: boolean }): Promise<User | undefined> => {
    if (!id && !username) {
        throw new Error('Either id or username must be provided');
    }

    let query = 'SELECT * FROM users WHERE ';
    const params: any[] = [];

    if (id) {
        query += 'id = ?';
        params.push(id);
    } else if (username) {
        query += 'username = ?';
        params.push(username);
    }

    const result = await client.execute(query, params, { prepare: true });

    if (result.rowLength === 0) {
        return undefined;
    }

    return mapRowIntoUser(result.first());
};
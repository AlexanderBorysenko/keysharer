import { generateRandomString } from "../../../utils/generateRandomString";
import { client } from "../../../db/client";

export const generateUniqueUsername = async (username: string = '') => {
    let newUsername = username || `user_${generateRandomString(6)}`;
    let counter = 1;

    while (true) {
        const query = 'SELECT * FROM users WHERE username = ?';
        const result = await client.execute(query, [newUsername], { prepare: true });

        if (result.rows.length === 0) {
            return newUsername;
        }

        counter++;
        newUsername = `${username}-${counter}`;
    }
}
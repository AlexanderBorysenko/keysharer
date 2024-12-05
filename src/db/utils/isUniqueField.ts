import { client } from "../client";

export const isUniqueField = async (table: string, field: string, value: string | number) => {
    const query = `SELECT id FROM ${table} WHERE ${field} = ? LIMIT 1`;
    const result = await client.execute(query, [value], { prepare: true });
    if (result.rows.length > 0) return false;
    return true;
}
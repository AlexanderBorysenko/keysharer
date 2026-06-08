import type { types } from "cassandra-driver";

export const rowToObject = <T>(row: types.Row) => {
	const keys = row.keys();
	const obj = {};
	keys.forEach((key) => {
		//@ts-ignore
		obj[key] = row.get(key);
	});

	return obj as T;
};

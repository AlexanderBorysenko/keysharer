import type { User } from "../user.types";
import { client } from "../../../db/client";
import { throwUserInputError } from "../../../errors/throwUserInputError";

export const verifyUserEmail = async (user: User, code: string) => {
	const query = `SELECT * FROM app_keyspace.email_verification_codes WHERE user_id = ? AND code = ?`;
	const params = [user.id, code];

	const result = await client.execute(query, params, { prepare: true });

	if (result.rowLength === 0)
		throwUserInputError("Invalid verification code");

	const verificationCode = result.first();

	const now = new Date();

	if (verificationCode.expiration_date < now) {
		const query = `DELETE FROM app_keyspace.email_verification_codes WHERE user_id = ? AND code = ?`;
		const params = [user.id, code];
		client.execute(query, params, { prepare: true });
		throwUserInputError("Verification code has expired");
	}

	const queries = [
		{
			query: `UPDATE app_keyspace.users SET email_verified = true WHERE id = ?`,
			params: [user.id],
		},
		{
			query: `DELETE FROM app_keyspace.email_verification_codes WHERE user_id = ? AND code = ?`,
			params: [user.id, code],
		},
	];

	await client.batch(queries, { prepare: true });
};

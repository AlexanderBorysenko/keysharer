import { randomInt } from "crypto";
import { sendEmail, type EmailOptions } from "../../../utils/emailUtils";
import { renderTemplate } from "../../../utils/htmlTemplateUtils";
import type { EmailVerificationCode, User } from "../user.types";
import { client } from "../../../db/client";
import { throwUserInputError } from "../../../errors/throwUserInputError";
import { mapRowIntoEmailVerificationCode } from "./mapRowIntoCode";

export const sendEmailVerificationCode = async (user: User) => {
	const checkQuery = `SELECT * FROM app_keyspace.email_verification_codes WHERE user_id = ?`;
	const checkParams = [user.id];

	const result = await client.execute(checkQuery, checkParams, {
		prepare: true,
	});

	const now = new Date();

	// Check if there are any existing codes
	if (result.rowLength > 0) {
		const existingCodes: EmailVerificationCode[] = result.rows.map(
			mapRowIntoEmailVerificationCode
		);

		// Filter out expired codes
		const expiredCodes = existingCodes.filter(
			(code) => code.expiresAt <= now
		);

		if (expiredCodes.length > 0) {
			// Delete expired codes
			const deleteQuery = `DELETE FROM app_keyspace.email_verification_codes WHERE user_id = ? AND code = ?`;
			for (const code of expiredCodes) {
				await client.execute(deleteQuery, [user.id, code.code], {
					prepare: true,
				});
			}
		} else {
			throwUserInputError("A verification code has already been issued.");
		}
	}

	const emailVerificationCode: EmailVerificationCode = {
		userId: user.id,
		code: randomInt(100000, 1000000).toString(),
		expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now,
		issuedAt: new Date(),
	};

	const query = `INSERT INTO app_keyspace.email_verification_codes (user_id, code, expiration_date, issued_at) VALUES (?, ?, ?, ?)`;
	const params = [
		emailVerificationCode.userId,
		emailVerificationCode.code,
		emailVerificationCode.expiresAt,
		emailVerificationCode.issuedAt,
	];

	await client.execute(query, params, { prepare: true });

	const html = await renderTemplate("email-verification", {
		username: user.username,
		verificationCode: emailVerificationCode.code,
	});

	const emailOptions: EmailOptions = {
		to: user.email!,
		subject: "KeySharer Email Verification",
		html: html,
	};

	sendEmail(emailOptions);
};

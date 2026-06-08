import { types } from "cassandra-driver";
import type { EmailVerificationCode } from "../user.types";

export const mapRowIntoEmailVerificationCode = (
	row: types.Row
): EmailVerificationCode => {
	return {
		userId: row.get("user_id"),
		code: row.get("code"),
		expiresAt: row.get("expires_at"),
		issuedAt: row.get("issued_at"),
	};
};

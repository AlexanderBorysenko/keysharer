import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { throwUserInputError } from "../../../errors/throwUserInputError";
import { isNotGuestMiddleware } from "../middleware/isNotGuestMiddleware";
import { verifyUserEmail } from "../service/verifyUserEmail";
import type { User } from "../user.types";
import {
	assertNotRateLimited,
	clearFailures,
	recordFailure,
} from "../../../services/rateLimiter";

// A legitimate user should never come close to this many wrong codes; it
// exists to stop someone from brute-forcing the 6-digit verification code.
const VERIFY_RATE_LIMIT_MAX = 10;
const VERIFY_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export type VerifyEmailInput = {
	code: string;
};

export const verifyEmailDefs = `
input VerifyEmailInput {
    code: String!
}

type Mutation {
    verifyEmail(input: VerifyEmailInput!): Boolean!
}
`;

export const verifyEmail = async (
	_: any,
	{ input }: { input: VerifyEmailInput },
	context: AppQraphQLContext
): Promise<boolean> => {
	const user: User = await isNotGuestMiddleware(context);

	if (user.emailVerified) throwUserInputError("Email is already verified");

	// Keyed by user id (stable, always available here since the user is
	// already authenticated) rather than the submitted code/email.
	const rateLimitKey = `verify:${user.id}`;
	assertNotRateLimited(
		rateLimitKey,
		VERIFY_RATE_LIMIT_MAX,
		VERIFY_RATE_LIMIT_WINDOW_MS
	);

	try {
		await verifyUserEmail(user, input?.code);
	} catch (error) {
		recordFailure(rateLimitKey, VERIFY_RATE_LIMIT_WINDOW_MS);
		throw error;
	}

	clearFailures(rateLimitKey);

	return true;
};

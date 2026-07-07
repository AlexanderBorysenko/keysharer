import { GraphQLError } from "graphql";
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

// The exact `extensions.code` that `throwUserInputError` sets on the
// `GraphQLError` it throws (see errors/throwUserInputError.ts). Used below to
// tell a genuine wrong/expired-code user error (which should cost the user a
// rate-limit attempt) apart from infrastructure errors, e.g. a Cassandra
// timeout inside `verifyUserEmail`, which should not.
const USER_INPUT_ERROR_CODE = "BAD_USER_INPUT";

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
		// Only a genuine wrong/expired verification code should consume the
		// user's rate-limit budget. Infrastructure errors (e.g. a DB timeout
		// inside `verifyUserEmail`) must not, otherwise an outage could
		// soft-lock legitimate users out of verifying their email.
		if (
			error instanceof GraphQLError &&
			error.extensions?.code === USER_INPUT_ERROR_CODE
		) {
			recordFailure(rateLimitKey, VERIFY_RATE_LIMIT_WINDOW_MS);
		}
		throw error;
	}

	clearFailures(rateLimitKey);

	return true;
};

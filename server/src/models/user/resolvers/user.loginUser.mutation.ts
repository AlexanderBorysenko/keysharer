import { throwUserInputError } from "../../../errors/throwUserInputError";
import { ValidationService } from "../../../services/validationService";
import bcrypt from "bcrypt";
import {
	createUserAccessToken,
	createUserRefreshToken,
} from "../service/createJWTToken";
import { findUser } from "../service/findUser";
import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isLocalhostRequest } from "../../../utils/isLocalhostRequest";
import {
	assertNotRateLimited,
	clearFailures,
	recordFailure,
} from "../../../services/rateLimiter";

// A legitimate user mistyping their password a handful of times in a row
// should never trip this; it exists to slow down credential-stuffing /
// brute-force attempts against a single username.
const LOGIN_RATE_LIMIT_MAX = 10;
const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export type LoginUserInput = {
	username: string;
	password: string;
};

export const loginUserDefs = `
input LoginUserInput {
    username: String!
    password: String!
}

type AuthPayload {
	refreshToken: String
    token: String!
    user: User!
}

type Mutation {
    loginUser(input: LoginUserInput!): AuthPayload!
}
`;

export const loginUser = async (
	parent: any,
	{ input }: { input: LoginUserInput },
	context: AppQraphQLContext
) => {
	await ValidationService.validate(
		{
			username: [
				(value: any) => (!value ? "Username is required." : null),
			],
			password: [
				(value: any) => (!value ? "Password is required." : null),
			],
		},
		input
	);

	const rateLimitKey = `login:${input.username}`;
	assertNotRateLimited(
		rateLimitKey,
		LOGIN_RATE_LIMIT_MAX,
		LOGIN_RATE_LIMIT_WINDOW_MS
	);

	const user = await findUser({ username: input.username });

	if (!user) {
		recordFailure(rateLimitKey, LOGIN_RATE_LIMIT_WINDOW_MS);
		return throwUserInputError("Invalid username or password.");
	}

	// Compare provided password with stored hash
	const isPasswordValid = await bcrypt.compare(
		input.password,
		user?.password || ""
	);
	if (!isPasswordValid) {
		recordFailure(rateLimitKey, LOGIN_RATE_LIMIT_WINDOW_MS);
		throwUserInputError("Invalid username or password.");
	}

	clearFailures(rateLimitKey);

	// Generate JWT token
	const acessToken = createUserAccessToken(user);

	// Generate RefreshToken
	const refreshToken = createUserRefreshToken(user);

	const isLocalhost = isLocalhostRequest(context);
	if (!isLocalhost) {
		await context.request.cookieStore?.set({
			name: "httpOnly_refresh_token",
			value: refreshToken,
			httpOnly: true,
			sameSite: "lax",
			secure: true,
			expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
			domain: process.env.COOKIE_DOMAIN,
			path: "/",
		});
	}

	return {
		token: acessToken,
		user: user,
		refreshToken: isLocalhost ? refreshToken : null,
	};
};

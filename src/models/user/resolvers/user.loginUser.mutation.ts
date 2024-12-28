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

	const user = await findUser({ username: input.username });

	if (!user) return throwUserInputError("Invalid username or password.");

	// Compare provided password with stored hash
	const isPasswordValid = await bcrypt.compare(
		input.password,
		user?.password || ""
	);
	if (!isPasswordValid) throwUserInputError("Invalid username or password.");

	// Generate JWT token
	const acessToken = createUserAccessToken(user);

	// Generate RefreshToken
	const refreshToken = createUserRefreshToken(user);

	const isLocalhost = isLocalhostRequest(context);
	if (isLocalhost) {
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

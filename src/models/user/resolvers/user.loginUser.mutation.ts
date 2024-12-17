import { throwUserInputError } from "../../../errors/throwUserInputError";
import { ValidationService } from "../../../services/validationService";
import bcrypt from "bcrypt";
import { createUserJWTToken } from "../service/createJWTToken";
import { findUser } from "../service/findUser";
import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";

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
	const token = createUserJWTToken(user);

	// send RefreshToken as a cookie
	// await context.request.cookieStore?.set({
	//     name: 'RefreshToken',
	//     value: token,
	//     httpOnly: true,
	//     sameSite: 'lax',
	//     secure: !process.env.IS_DEV,
	//     expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
	//     domain: process.env.COOKIE_DOMAIN,
	//     path: '/',
	// });

	return {
		token,
		user,
	};
};

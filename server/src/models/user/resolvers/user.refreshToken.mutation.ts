import { createUserAccessToken } from "../service/createJWTToken";
import { throwUnauthenticatedError } from "../../../errors/throwUnauthenticatedError";
import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { getContextRefreshToken } from "../../../utils/getContextRefreshToken";
import { validateRefreshToken } from "../../../utils/validateRefreshToken";
import type { User } from "../user.types";

export const refreshTokenDefs = `
type Mutation {
	refreshToken(refreshToken: String): AuthPayload!
}
`;

export const refreshToken = async (
	_: unknown,
	args: { refreshToken?: string },
	context: AppQraphQLContext
) => {
	const token = args.refreshToken || getContextRefreshToken(context);

	if (!token) throw throwUnauthenticatedError("No token provided");

	try {
		const user: User = await validateRefreshToken(token);

		const accessToken = createUserAccessToken(user);

		return {
			token: accessToken,
			user,
		};
	} catch (err) {
		console.error("Error verifying token:", err);
		throwUnauthenticatedError("Authentication failed");
	}
};

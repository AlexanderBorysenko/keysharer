import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { throwForbiddenError } from "../../../errors/throwForbiddenError";
import { isAuthenticatedMiddleware } from "./isAuthenticatedMiddleware";

export const isEmailVerifiedMiddleware = async (context: AppQraphQLContext) => {
	const user = await isAuthenticatedMiddleware(context);

	if (!user.emailVerified) {
		return throwForbiddenError("Email not verified");
	}

	return user;
};

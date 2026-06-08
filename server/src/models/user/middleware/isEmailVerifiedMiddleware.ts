import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { throwForbiddenError } from "../../../errors/throwForbiddenError";
import { isNotGuestMiddleware } from "./isNotGuestMiddleware";

export const isEmailVerifiedMiddleware = async (context: AppQraphQLContext) => {
	const user = await isNotGuestMiddleware(context);

	// if (!user.emailVerified) {
	// 	return throwForbiddenError("Email not verified");
	// }

	return user;
};

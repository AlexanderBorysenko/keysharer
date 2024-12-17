import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { throwForbiddenError } from "../../../errors/throwForbiddenError";
import { Role } from "../user.types";
import { isAuthenticatedMiddleware } from "./isAuthenticatedMiddleware";

export const isNotGuestMiddleware = async (context: AppQraphQLContext) => {
	const user = await isAuthenticatedMiddleware(context);

	if (user.role === Role.GUEST) {
		return throwForbiddenError(
			"Guest users are not allowed to perform this action"
		);
	}

	return user;
};

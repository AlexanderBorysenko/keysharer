import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { throwUnauthenticatedError } from "../../../errors/throwUnauthenticatedError";

export const isAuthenticatedMiddleware = async (context: AppQraphQLContext) => {
	if (!context.user) {
		return throwUnauthenticatedError("User not authenticated");
	}
	return context.user;
};

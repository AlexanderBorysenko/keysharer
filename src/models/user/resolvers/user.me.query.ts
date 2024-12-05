// import { getContextUserMiddleware } from "../service/getContextUserMiddleware";
import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { throwUnauthenticatedError } from "../../../errors/throwUnauthenticatedError";

export const meQueryDef = `me: User!`;

export const meQuery = async (_: any, __: any, context: AppQraphQLContext) => {
    if (!context.user) {
        return throwUnauthenticatedError('User not authenticated');
    }
    return context.user;
};
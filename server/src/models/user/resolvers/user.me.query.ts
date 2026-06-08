import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../middleware/isAuthenticatedMiddleware";
import type { User } from "../user.types";

export const meQueryDefs = `
    type Query {  
        me: User!
    }
`;

export const meQuery = async (
	_: any,
	__: any,
	context: AppQraphQLContext
): Promise<User> => {
	const user: User = await isAuthenticatedMiddleware(context);
	return user;
};

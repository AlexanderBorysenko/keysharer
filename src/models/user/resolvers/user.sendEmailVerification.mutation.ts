import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { throwConflictError } from "../../../errors/throwConflictError";
import { isAuthenticatedMiddleware } from "../middleware/isAuthenticatedMiddleware";
import { sendEmailVerificationCode } from "../service/sendEmailVerificationCode";

export const sendEmailVerificationDefs = `
type Mutation {
    sendEmailVerification: Boolean!
}
`;

export const sendEmailVerification = async (
	_: any,
	__: any,
	context: AppQraphQLContext
) => {
	const user = await isAuthenticatedMiddleware(context);
	// TODO: check if user is not guest

	if (user.emailVerified) throwConflictError("Email is already verified");

	await sendEmailVerificationCode(user);

	return true;
};

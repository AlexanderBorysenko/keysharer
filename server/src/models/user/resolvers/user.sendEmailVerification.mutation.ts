import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { throwConflictError } from "../../../errors/throwConflictError";
import { isNotGuestMiddleware } from "../middleware/isNotGuestMiddleware";
import { sendEmailVerificationCode } from "../service/sendEmailVerificationCode";
import type { User } from "../user.types";

export const sendEmailVerificationDefs = `
type Mutation {
    sendEmailVerification: Boolean!
}
`;

export const sendEmailVerification = async (
	_: any,
	__: any,
	context: AppQraphQLContext
): Promise<Boolean> => {
	const user: User = await isNotGuestMiddleware(context);

	if (user.emailVerified) throwConflictError("Email is already verified");

	await sendEmailVerificationCode(user);

	return true;
};

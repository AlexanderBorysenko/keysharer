import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { throwUserInputError } from "../../../errors/throwUserInputError";
import { isNotGuestMiddleware } from "../middleware/isNotGuestMiddleware";
import { verifyUserEmail } from "../service/verifyUserEmail";
import type { User } from "../user.types";

export type VerifyEmailInput = {
	code: string;
};

export const verifyEmailDefs = `
input VerifyEmailInput {
    code: String!
}

type Mutation {
    verifyEmail(input: VerifyEmailInput!): Boolean!
}
`;

export const verifyEmail = async (
	_: any,
	{ input }: { input: VerifyEmailInput },
	context: AppQraphQLContext
): Promise<boolean> => {
	const user: User = await isNotGuestMiddleware(context);

	if (user.emailVerified) throwUserInputError("Email is already verified");

	await verifyUserEmail(user, input?.code);

	return true;
};

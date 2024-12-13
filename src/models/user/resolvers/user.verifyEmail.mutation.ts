import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { throwUserInputError } from "../../../errors/throwUserInputError";
import { isAuthenticatedMiddleware } from "../middleware/isAuthenticatedMiddleware";
import { verifyUserEmail } from "../service/verifyUserEmail";

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
	const user = await isAuthenticatedMiddleware(context);
	// TODO: check if user is not guest

	if (user.emailVerified) throwUserInputError("Email is already verified");

	await verifyUserEmail(user, input?.code);

	return true;
};

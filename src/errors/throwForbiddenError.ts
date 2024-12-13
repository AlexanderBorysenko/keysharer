import { GraphQLError } from "graphql";

export const throwForbiddenError = (
	message: string,
	args?: {
		messages?: { [key: string]: string };
	}
) => {
	throw new GraphQLError(message, {
		extensions: {
			code: "403",
			error: "Forbidden",
			messages: args?.messages,
		},
	});
};

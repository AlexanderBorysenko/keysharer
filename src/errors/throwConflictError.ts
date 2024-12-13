import { GraphQLError } from "graphql";

export const throwConflictError = (
	message: string,
	args?: {
		messages?: { [key: string]: string };
	}
) => {
	throw new GraphQLError(message, {
		extensions: {
			code: "409",
			error: "Conflict",
			messages: args?.messages,
		},
	});
};

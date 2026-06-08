import { GraphQLError } from "graphql";

export const throwTooManyRequestsError = (
	message: string,
	args?: {
		messages?: { [key: string]: string };
	}
) => {
	throw new GraphQLError(message, {
		extensions: {
			code: "429",
			error: "Too Many Requests",
			messages: args?.messages,
		},
	});
};

import { GraphQLError } from 'graphql';

export const throwUserInputError = (
    message: string,
    args?: {
        messages?: { [key: string]: string }
    }
) => {
    throw new GraphQLError(message, {
        extensions: {
            code: 'BAD_USER_INPUT',
            details: args?.messages,
        },
    })
}
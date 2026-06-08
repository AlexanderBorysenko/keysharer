import { GraphQLError } from 'graphql';

export const throwUnexpectedError = (
    message: string,
    args?: {
        messages?: { [key: string]: string }
    }
) => {
    throw new GraphQLError(message, {
        extensions: {
            code: 'UNEXPECTED_ERROR',
            messages: args?.messages,
        },
    })
}
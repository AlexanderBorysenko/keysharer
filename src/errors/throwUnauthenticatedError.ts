import { GraphQLError } from 'graphql';

export const throwUnauthenticatedError = (
    message: string,
    args?: {
        messages?: { [key: string]: string }
    }
) => {
    throw new GraphQLError(message, {
        extensions: {
            code: '401',
            messages: args?.messages,
        },
    })
}
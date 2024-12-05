import { GraphQLError } from 'graphql';

export const throw404Error = (
    message: string,
    args?: {
        messages?: { [key: string]: string }
    }
) => {
    throw new GraphQLError(message, {
        extensions: {
            code: '404',
            messages: args?.messages,
        },
    })
}
export const getResponseUserInputErrors = (response: any): {
    [key: string]: string;
} => {
    if (!response.errors) return {};

    const error = response.errors.find((error: any) => error.extensions.code === 'BAD_USER_INPUT');
    if (!error || !error.extensions.details) return {};

    return error.extensions.details;
}
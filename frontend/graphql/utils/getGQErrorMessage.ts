export const getGQErrorMessage = (error: any): string => {
    try {
        const errors = error.response?.errors || error.errors || error;
        return Array.isArray(errors) ? errors.map((err: any) => err.message).join(', ') : 'Unknown error';
    } catch {
        return 'Unknown error';
    }
};

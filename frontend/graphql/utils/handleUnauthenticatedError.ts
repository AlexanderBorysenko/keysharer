export const handleUnauthenticatedError = (error: any) => {
    const {
        logout
    } = useUserStore();

    try {
        const errors = error?.response?.errors || error?.errors || error;
        if (
            errors.find((e: any) => e.extensions.error.toLocaleLowerCase() === 'unauthenticated') ||
            errors.find((e: any) => e.extensions.code.toLocaleLowerCase().includes('unauthenticated', '401'))
        ) {
            logout();
        }
    } catch (e) {
    }
}
export default defineNuxtPlugin((nuxtApp) => {

    const isLocalhost = process.env.NODE_ENV === 'development';
    const AuthorizationToken = useCookie('Authorization', {
        secure: true,
        httpOnly: false,
        sameSite: 'lax',
        domain: isLocalhost ? 'localhost' : '.keysharer.com',
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        path: "/",
    });

    const isUserInitialized = ref<boolean>(false);

    return {
        provide: {
            AuthorizationToken,
            isUserInitialized,
        },
    };
})

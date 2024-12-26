export default defineNuxtPlugin((nuxtApp) => {
    const tokenExpirationIntervalTime = new Date(Date.now() + 1000 * 60 * 25)
    const isLocalhost = process.env.NODE_ENV === 'development';
    const AuthorizationToken = useCookie('Authorization', {
        secure: true,
        httpOnly: false,
        sameSite: 'lax',
        domain: isLocalhost ? 'localhost' : '.keysharer.com',
        expires: tokenExpirationIntervalTime, // 25 minutes
        path: "/",
        watch: true,
    });

    const isUserInitialized = ref<boolean>(false);

    const isWsConnected = ref<boolean>(false);

    return {
        provide: {
            AuthorizationToken,
            isUserInitialized,
            isWsConnected,
            tokenExpirationIntervalTime
        },
    };
})

export default defineNuxtPlugin((nuxtApp) => {
    const tokenExpirationIntervalTime = 60 * 1000 * 25; // 25 minute in milliseconds
    const isLocalhost = process.env.NODE_ENV === 'development';
    const AuthorizationToken = useCookie('Authorization', {
        secure: true,
        httpOnly: false,
        sameSite: 'lax',
        domain: isLocalhost ? 'localhost' : '.keysharer.com',
        path: "/",
        watch: true,
    });
    const previousAuthTokenUpdateDate = ref<Date | null>(null);
    watch(AuthorizationToken, () => {
        previousAuthTokenUpdateDate.value = new Date();
    }, { immediate: true });

    const isUserInitialized = ref<boolean>(false);
    const isUserAuthorized = ref<boolean>(false);

    const isWsConnected = ref<boolean>(false);

    return {
        provide: {
            AuthorizationToken,
            isUserAuthorized,
            isUserInitialized,
            previousAuthTokenUpdateDate,
            isWsConnected,
            tokenExpirationIntervalTime
        },
    };
})

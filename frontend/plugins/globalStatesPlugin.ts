export default defineNuxtPlugin((nuxtApp) => {
    const tokenExpirationIntervalTime = 60 * 1000 * 25; // 25 minute in milliseconds
    const AuthorizationToken = ref<string | null>(localStorage.getItem('AuthorizationToken'));
    watch(AuthorizationToken, (newToken) => {
        if (newToken) {
            localStorage.setItem('AuthorizationToken', newToken);
        } else {
            localStorage.removeItem('AuthorizationToken');
        }
    });

    const previousAuthTokenUpdateDate = ref<Date | null>(null);
    watch(AuthorizationToken, () => {
        previousAuthTokenUpdateDate.value = new Date();
    });

    const isUserInitialized = ref<boolean>(false);
    const isUserLoggedIn = ref<boolean>(false);

    const isWsConnected = ref<boolean>(false);

    const isTauri = '__TAURI__' in window || '__TAURI_INTERNALS__' in window;

    return {
        provide: {
            AuthorizationToken,
            isUserLoggedIn,
            isUserInitialized,
            previousAuthTokenUpdateDate,
            isWsConnected,
            tokenExpirationIntervalTime,
            isTauri,
        },
    };
})

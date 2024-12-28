declare global {
    interface Window {
        __VISIBILITY_LISTENER__?: boolean;
        __TOKEN_REFRESH_INTERVAL__?: NodeJS.Timeout;
        __ONLINE_LISTENER__?: boolean;
    }
}

export default defineNuxtRouteMiddleware(async (to, from) => {
    const {
        $onOnline,
        $onAppVisible,
        $AuthorizationToken,
        $isUserInitialized,
        $previousAuthTokenUpdateDate,
        $tokenExpirationIntervalTime
    } = useNuxtApp();
    const userStore = useUserStore();

    if (!$isUserInitialized.value) {
        console.log('User not initialized, initializing');
        await userStore.initializeUser();
    }
    let tokenRefreshTimeout: NodeJS.Timeout | null = null;
    const isExpired = () => {
        if (!$previousAuthTokenUpdateDate.value) return true;
        (new Date().getTime() - $previousAuthTokenUpdateDate.value.getTime()) > $tokenExpirationIntervalTime;
    }
    if (isExpired()) {
        console.log('Token expired by init, refreshing');
        await userStore.refreshToken();
    }
    watch($AuthorizationToken, () => {
        $previousAuthTokenUpdateDate.value = new Date();
        if (tokenRefreshTimeout) clearTimeout(tokenRefreshTimeout);
        tokenRefreshTimeout = setTimeout(() => {
            if (!$AuthorizationToken.value) return;
            console.log('Token expired by timeout, refreshing');
            userStore.refreshToken();
        }, $tokenExpirationIntervalTime);
    }, { immediate: true });
    if (!window.__VISIBILITY_LISTENER__) {
        window.__VISIBILITY_LISTENER__ = true;
        $onAppVisible(() => {
            if (!userStore.state.id || !isExpired()) return;
            console.log('Token expired by visibility, refreshing');
            userStore.refreshToken();
        });
    }
    if (!window.__ONLINE_LISTENER__) {
        window.__ONLINE_LISTENER__ = true;
        $onOnline(() => {
            if (!userStore.state.id || !isExpired()) return;
            console.log('Token expired by online, refreshing');
            userStore.refreshToken();
        });
    }

    return;
});

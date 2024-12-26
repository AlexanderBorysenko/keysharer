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
        $tokenExpirationIntervalTime
    } = useNuxtApp();
    const userStore = useUserStore();
    console.log('Auth middleware', to.path, from.path, userStore.state.id);
    if (from.path.includes('login') && userStore.state.id) return;
    await userStore.initializeUser();

    let previousTokenUpdateDate: Date = new Date();
    let tokenRefreshTimeout: NodeJS.Timeout | null = null;
    const isExpired = () => (new Date().getTime() - previousTokenUpdateDate.getTime()) > $tokenExpirationIntervalTime.getTime();

    if (import.meta.client) {
        watch($AuthorizationToken, () => {
            if (!$AuthorizationToken.value) return;
            previousTokenUpdateDate = new Date();
            if (tokenRefreshTimeout) clearTimeout(tokenRefreshTimeout);
            tokenRefreshTimeout = setTimeout(() => {
                userStore.refreshToken();
            }, $tokenExpirationIntervalTime.getTime());
        });
        if (!window.__VISIBILITY_LISTENER__) {
            window.__VISIBILITY_LISTENER__ = true;
            $onAppVisible(() => {
                if (!userStore.state.id || !isExpired()) return;
                userStore.refreshToken();
            });
        }
        if (!window.__ONLINE_LISTENER__) {
            window.__ONLINE_LISTENER__ = true;
            $onOnline(() => {
                if (!userStore.state.id || !isExpired()) return;
                userStore.refreshToken();
            });
        }
    }

    return;
});

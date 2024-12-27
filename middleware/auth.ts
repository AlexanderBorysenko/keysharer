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
    if (from.path.includes('login') && !userStore.state.id) await userStore.initializeUser();

    let previousTokenUpdateDate: Date = new Date();
    let tokenRefreshTimeout: NodeJS.Timeout | null = null;
    const isExpired = () => (new Date().getTime() - previousTokenUpdateDate.getTime()) > $tokenExpirationIntervalTime;

    if (import.meta.client) {
        console.log('Auth middleware client working');
        watch($AuthorizationToken, () => {
            previousTokenUpdateDate = new Date();
            if (tokenRefreshTimeout) clearTimeout(tokenRefreshTimeout);
            console.log('Token updated', $AuthorizationToken.value, 'Next refresh in', $tokenExpirationIntervalTime);
            tokenRefreshTimeout = setTimeout(() => {
                if (!$AuthorizationToken.value) return;
                userStore.refreshToken();
            }, $tokenExpirationIntervalTime);
        }, { immediate: true });
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

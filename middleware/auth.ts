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

    if (!$AuthorizationToken.value) {
        userStore.logout();
    }
    const isExpired = () => {
        if (!$previousAuthTokenUpdateDate.value) return true;
        return (new Date().getTime() - $previousAuthTokenUpdateDate.value.getTime()) >= $tokenExpirationIntervalTime * 0.9;
    }
    if ($AuthorizationToken.value && isExpired()) {
        console.log('Token expired by init, refreshing');
        await userStore.refreshToken();
    }
    if ($AuthorizationToken.value && !$isUserInitialized.value) {
        console.log('User not initialized, initializing');
        await userStore.initializeUser();
    }

    const setupRefreshTokenTriggers = () => {
        if (!window.__TOKEN_REFRESH_INTERVAL__) {
            window.__TOKEN_REFRESH_INTERVAL__ = setInterval(() => {
                if (!userStore.state.id || !isExpired()) return;
                console.log('Token expired by interval, refreshing');
                userStore.refreshToken();
            }, $tokenExpirationIntervalTime);
        }

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
    }

    if ($AuthorizationToken.value) {
        setupRefreshTokenTriggers();
    }
    watch($AuthorizationToken, () => {
        if ($AuthorizationToken.value) {
            setupRefreshTokenTriggers();
        }
    }, { immediate: true });

    return;
});

declare global {
    interface Window {
        __VISIBILITY_LISTENER__?: boolean;
        __TOKEN_REFRESH_INTERVAL__?: NodeJS.Timeout;
    }
}

export default defineNuxtRouteMiddleware(async (to, from) => {
    const {
        $onOnline
    } = useNuxtApp();
    const userStore = useUserStore();
    console.log('Auth middleware', to.path, from.path, userStore.state.id);
    if (from.path.includes('login') && userStore.state.id) return;
    await userStore.initializeUser();

    if (import.meta.client) {
        // Handle token refresh interval
        if (!window.__TOKEN_REFRESH_INTERVAL__) {
            window.__TOKEN_REFRESH_INTERVAL__ = setInterval(async () => {
                if (!userStore.state.id) return;
                await userStore.refreshToken();
            }, 1000 * 60 * 5); // 5 minutes
        }
        $onOnline(() => {
            if (!userStore.state.id) return;
            userStore.refreshToken();
        });
    }

    return;
});

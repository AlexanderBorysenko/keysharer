export default defineNuxtRouteMiddleware((to, from) => {
    const userStore = useUserStore();

    if (userStore.state.id) {
        return navigateTo('/');
    }
});
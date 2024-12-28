export default defineNuxtRouteMiddleware((to, from) => {
    const {
        $AuthorizationToken
    } = useNuxtApp();
    if ($AuthorizationToken.value) {
        return navigateTo('/');
    }
});
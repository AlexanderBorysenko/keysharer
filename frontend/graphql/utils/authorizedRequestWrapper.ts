import useUserStore from '~/stores/useUserStore';

export const authorizedRequestWrapper = async (
    request: any,
) => {
    const {
        logout
    } = useUserStore();

    try {
        return await request();
    } catch (err) {
        logout();
        console.error(err);
        return null;
    }
}
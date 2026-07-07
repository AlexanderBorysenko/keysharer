export const useOnlineStatusesStore = defineStore('onlineStatusesStore', () => {
    const onlineUsers = reactive<Map<string, boolean>>(new Map());
    const { $useSubscription: useSubscription } = useNuxtApp();

    const listenToUser = (userId: string, isOnline: boolean) => {
        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, isOnline);
            const { on } = useSubscription({
                onlineStatusChanged: [{
                    userId,
                }, true]
            })
            on((live) => {
                onlineUsers.set(userId, live);
            });
        }
    }

    const getUserOnlineStatus = (userId: string) => {
        return onlineUsers.get(userId) || false;
    }

    const countUsersSelectionOnline = (userIds: string[]) => {
        return userIds.reduce((acc, userId) => acc + (onlineUsers.get(userId) ? 1 : 0), 0);
    }

    return {
        listenToUser,
        getUserOnlineStatus,
        countUsersSelectionOnline
    }
});
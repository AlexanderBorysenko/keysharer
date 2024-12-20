export const useOnlineStatusesStore = defineStore('onlineStatusesStore', () => {
    const listeners = ref<{
        id: string;
        isOnline: boolean;
        callbacks: ((isOnline: boolean) => void)[];
    }[]>([]);

    const getUserListenerIndex = (userId: string) => {
        return listeners.value.findIndex(l => l.id === userId);
    }
    const getUserListener = (userId: string) => {
        return listeners.value[getUserListenerIndex(userId)];
    }
    const getUserOnlineStatus = (userId: string): boolean => {
        return getUserListener(userId)?.isOnline ?? false;
    }
    const countUsersSelectionOnline = (userIds: string[]): number => {
        return userIds.reduce((acc, userId) => {
            return acc + (getUserOnlineStatus(userId) ? 1 : 0);
        }, 0);
    }

    const listenToUser = (userId: string, isOnline: boolean) => {
        // If already listening to user, return
        if (getUserListenerIndex(userId) !== -1) return;

        listeners.value.push({
            id: userId,
            isOnline,
            callbacks: [],
        });

        const { on } = useSubscription({
            onlineStatusChanged: [{
                userId,
            }, true]
        })
        on((isOnline) => {
            const listenerIndex = getUserListenerIndex(userId);
            if (listenerIndex === -1) return;
            listeners.value[listenerIndex].isOnline = isOnline;
            listeners.value[listenerIndex].callbacks.forEach(cb => cb(
                isOnline
            ));
        });
    }

    const onUserOnlineChange = (userId: string, callback: (isOnline: boolean) => void) => {
        const listenerIndex = getUserListenerIndex(userId);
        if (listenerIndex === -1) return;
        const listener = listeners.value[listenerIndex];

        listener.callbacks.push(callback);
    };

    const offUserOnlineChange = (userId: string,
        callback: (isOnline: boolean) => void
    ) => {
        const listenerIndex = getUserListenerIndex(userId);
        if (listenerIndex === -1) return;
        const listener = listeners.value[listenerIndex];
        const callbackIndex = listener.callbacks.indexOf(callback);
        if (callbackIndex !== -1) {
            listener.callbacks.splice(callbackIndex, 1);
        }
    };

    return {
        listenToUser,
        getUserOnlineStatus,
        countUsersSelectionOnline,
        onUserOnlineChange,
        offUserOnlineChange,
    }
});
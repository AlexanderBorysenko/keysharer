export default defineNuxtPlugin((nuxtApp) => {
    const onlineCallbacks: Array<() => void> = [];
    const offlineCallbacks: Array<() => void> = [];

    const onOnline = () => {
        onlineCallbacks.forEach(callback => callback());
    };

    const onOffline = () => {
        offlineCallbacks.forEach(callback => callback());
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    const addOnlineCallback = (callback: () => void) => {
        onlineCallbacks.push(callback);
    };

    const removeOnlineCallback = (callback: () => void) => {
        const index = onlineCallbacks.indexOf(callback);
        if (index !== -1) {
            onlineCallbacks.splice(index, 1);
        }
    };

    const addOfflineCallback = (callback: () => void) => {
        offlineCallbacks.push(callback);
    };

    const removeOfflineCallback = (callback: () => void) => {
        const index = offlineCallbacks.indexOf(callback);
        if (index !== -1) {
            offlineCallbacks.splice(index, 1);
        }
    };

    return {
        provide: {
            onOnline: addOnlineCallback,
            removeOnOnline: removeOnlineCallback,
            onOffline: addOfflineCallback,
            removeOnOffline: removeOfflineCallback,
        },
    };
});
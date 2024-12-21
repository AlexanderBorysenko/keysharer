export default defineNuxtPlugin((nuxtApp) => {
    const callbacks: Array<() => void> = [];
    let wasHidden = false;

    if (import.meta.client) {
        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible' && wasHidden) {
                callbacks.forEach(callback => callback());
            }
            wasHidden = document.visibilityState === 'hidden';
        };

        document.addEventListener('visibilitychange', onVisibilityChange);
    }

    const onAppVisible = (callback: () => void) => {
        callbacks.push(callback);
    };

    const removeOnAppVisible = (callback: () => void) => {
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
            callbacks.splice(index, 1);
        }
    };

    const callOnAppVisible = () => {
        callbacks.forEach(callback => callback());
    }

    return {
        provide: {
            onAppVisible,
            removeOnAppVisible,
            callOnAppVisible
        },
    };
});
export const useQueue = () => {
    const callbackQueue: (() => Promise<void>)[] = [];
    let isProcessingQueue = false;

    const process = async () => {
        if (isProcessingQueue) return;
        isProcessingQueue = true;
        while (callbackQueue.length > 0) {
            const callback = callbackQueue.shift();
            if (callback) await callback();
        }
        isProcessingQueue = false;
    };

    const pushToQueue = (callback: () => Promise<void>) => {
        callbackQueue.push(callback);
        process();
    };

    return {
        pushToQueue
    };
}
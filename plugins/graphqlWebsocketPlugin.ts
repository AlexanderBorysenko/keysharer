import { ref, watch } from 'vue';
// utils/wsClient.ts
import { Subscription } from '~/graphql/zeus';
import { v4 } from 'uuid';

interface WsClientOptions {
    wsEndpoint: string;
    token: string | null;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (error: Event) => void;
}

export function createWsClient(options: WsClientOptions) {
    const { wsEndpoint, token, onOpen, onClose, onError } = options;

    // If no token, no client should be created
    if (!token) {
        console.info('No token provided. WebSocket client will not be created.');
        return { client: null, close: () => { } };
    }

    console.info('Creating WebSocket client.');

    const client = Subscription(wsEndpoint, {
        get headers() {
            return {
                'Content-Type': 'application/json',
                Authorization: token || '',
                'sessionIdentifier': v4().toString(),
            };
        },
    });

    const connection = client('subscription')({ wsConnectionInitial: true });
    connection.on(() => {
        console.info('WebSocket connection opened.');
        if (onOpen) onOpen();
    })
    connection.error(({
        data, errors
    }) => {
        if (!data && !errors) return;
        console.error('<<<<< WebSocket encountered an error >>>>>', errors, data);
        if (onError) onError(new Event('WebSocket encountered an error'));
    });
    connection.off(({
        code, data, message, reason
    }) => {
        console.info('<<<<< WebSocket connection closed >>>>>', code, data, message, reason);
        if (onClose) onClose();
        if (code !== 1000) {
            console.error('WebSocket connection closed with error:', code, data, message, reason);
            if (onError) onError(new Event('WebSocket connection closed with error'));
        }
    });

    const close = () => {
        console.info('Closing WebSocket connection.');
        connection.ws.close();
    };

    return { client, close };
}

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig();
    const wsEndpoint = config.public.wsHost;

    const { $AuthorizationToken, $isUserInitialized, $onAppVisible, $callOnAppVisible } = useNuxtApp();

    const wsClientRef = ref<ReturnType<typeof Subscription> | null>(null);
    watch(() => wsClientRef.value, (client) => {
        console.info('WebSocket client changed:', client);
    })
    let closePreviousConnection = () => { };

    let reconnectTimeout: number | null = null;
    let reconnectAttempts = 0;

    function clearReconnect() {
        if (reconnectTimeout) {
            console.info('Clearing reconnect timeout.');
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }
    }

    function attemptReconnect() {
        clearReconnect();
        if (!$AuthorizationToken.value) {
            console.info('No token available. Will not attempt to reconnect.');
            return; // If no token, no reconnect
        }

        reconnectAttempts++;
        console.info(`Attempting to reconnect (${reconnectAttempts}).`);

        const delay = Math.min(1000 * reconnectAttempts, 10000);
        reconnectTimeout = window.setTimeout(() => {
            initWsClient();
        }, delay);
    }

    function initWsClient() {
        clearReconnect();

        console.info('Closing previous connection if any and setting new WebSocket client.');
        closePreviousConnection();

        if (!$AuthorizationToken.value) {
            // No token: close and nullify
            console.info('No token found. Closing previous connection if any.');
            wsClientRef.value = null;
            return;
        }

        const { client, close } = createWsClient({
            wsEndpoint,
            token: $AuthorizationToken.value,
            onOpen: () => {
                console.info('WebSocket connection established.');
                if (reconnectAttempts > 0) {
                    // If reconnected, call onAppVisible to sync data
                    $callOnAppVisible();
                }
                reconnectAttempts = 0;
            },
            onClose: () => {
                console.info('WebSocket connection closed.');
                // If token is still present, attempt reconnection
                if ($AuthorizationToken.value) {
                    attemptReconnect();
                }
            },
            onError: (error) => {
                console.info('WebSocket encountered an error:', error);
                // On error, try to reconnect if still authorized
                if ($AuthorizationToken.value) {
                    attemptReconnect();
                }
            },
        });

        closePreviousConnection = close;
        wsClientRef.value = client;
    }

    // Re-initialize on token change
    watch(
        [() => $AuthorizationToken.value, () => $isUserInitialized.value],
        () => {
            if (!import.meta.client || !$isUserInitialized.value) return;
            initWsClient();
        },
        { immediate: true }
    );

    // Close on page unload
    if (import.meta.client) {
        window.addEventListener('beforeunload', () => {
            console.info('Page unloading. Closing WebSocket connection.');
            closePreviousConnection();
        });
        // add listener for visibility change
        $onAppVisible(() => {
            if (!$isUserInitialized.value) return
            console.info('Page visibility restored. Re-initializing WebSocket client.');
            initWsClient();
        });
    }

    return {
        provide: {
            wsClient: wsClientRef,
        },
    };
});
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

    // Check if ws property exists and attach event handlers if possible
    if (connection.ws) {
        if (onOpen) connection.ws.onopen = () => {
            console.info('WebSocket connection opened.');
            onOpen();
        };
        if (onClose) connection.ws.onclose = () => {
            console.info('WebSocket connection closed.');
            onClose();
        };
        if (onError) connection.ws.onerror = (error) => {
            console.info('WebSocket error occurred:', error);
            onError(error);
        };
    }

    const close = () => {
        console.info('Closing WebSocket connection.');
        connection.ws.close();
    };

    return { client, close };
}

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig();
    const wsEndpoint = config.public.wsHost;

    const { $AuthorizationToken } = useNuxtApp();

    const wsClientRef = ref<ReturnType<typeof Subscription> | null>(null);
    let closePreviousConnection = () => { };

    let reconnectTimeout: number | null = null;
    let reconnectAttempts = 0;
    const maxAttempts = 5; // Adjust as needed

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
        console.info(`Attempting to reconnect (${reconnectAttempts}/${maxAttempts}).`);

        const delay = Math.min(1000 * reconnectAttempts, 15000);
        reconnectTimeout = window.setTimeout(() => {
            initWsClient();
        }, delay);
    }

    function initWsClient() {
        clearReconnect();

        if (!$AuthorizationToken.value) {
            // No token: close and nullify
            console.info('No token found. Closing previous connection if any.');
            closePreviousConnection();
            wsClientRef.value = null;
            return;
        }

        const { client, close } = createWsClient({
            wsEndpoint,
            token: $AuthorizationToken.value,
            onOpen: () => {
                console.info('WebSocket connection established.');
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

        console.info('Closing previous connection if any and setting new WebSocket client.');
        closePreviousConnection();
        closePreviousConnection = close;
        wsClientRef.value = client;
    }

    // Re-initialize on token change
    watch(
        () => $AuthorizationToken.value,
        () => {
            if (!import.meta.client) return;
            console.info('Authorization token changed. Re-initializing WebSocket client.');
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
    }

    return {
        provide: {
            wsClient: wsClientRef,
        },
    };
});
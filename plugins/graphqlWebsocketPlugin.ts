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
    const { wsEndpoint, token } = options;

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

    const close = () => {
        connection.ws.close();
    }

    return { client, close };
}

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig();
    const wsEndpoint = config.public.wsHost;

    const { $AuthorizationToken, $isUserInitialized, $onAppVisible, $onOffline, $onOnline } = useNuxtApp();

    const wsClientRef = ref<ReturnType<typeof Subscription> | null>(null);
    watch(() => wsClientRef.value, (client) => {
        console.info('WebSocket client changed:', client);
    })

    let closePreviousConnection = () => { };

    function initWsClient() {
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
        });

        closePreviousConnection = close;
        wsClientRef.value = client;
    }
    $onOffline(() => {
        console.info('Offline. Closing WebSocket connection.');
        closePreviousConnection();
    })
    $onOnline(() => {
        console.info('Online. Re-initializing WebSocket client.');
        initWsClient();
    })

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
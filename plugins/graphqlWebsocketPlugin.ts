import { ref, watch } from 'vue';
import { Subscription } from '~/graphql/zeus';
import { v4 } from 'uuid';

interface WsClientOptions {
    wsEndpoint: string;
    token: string | null;
    pingPongId?: string;
    onError?: () => void;
}

let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

export function createWsClient(options: WsClientOptions) {
    const { wsEndpoint, token, onError } = options;

    // Якщо немає токена, не створюємо WebSocket-клієнт
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
                pingPongId: options.pingPongId || '',
            };
        },
    });

    const connection = client('subscription')({ wsConnectionInitial: true });

    // Відловлюємо помилку
    connection.error(({ data, errors }) => {
        console.log('WebSocket error:', data, errors);

        // Викликаємо onError, якщо передано
        if (onError) {
            onError();
        }
    });

    const close = () => {
        connection.ws.close();
    };

    return { client, close };
}

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig();
    const wsEndpoint = config.public.wsHost;
    const pingPongId = ref<string>(v4());

    const {
        $AuthorizationToken,
        $isUserInitialized,
    } = useNuxtApp();

    // Поточний WebSocket-клієнт
    const wsClientRef = ref<ReturnType<typeof Subscription> | null>(null);

    watch(() => wsClientRef.value, (client) => {
        console.info('WebSocket client changed:', client);
    });

    // Закриває попереднє з’єднання (змінюватимемо це при кожному initWsClient())
    let closePreviousConnection = () => { };

    /**
     * Головна функція ініціалізації (або перевідкриття) WebSocket:
     * - закриває попередній клієнт;
     * - створює новий;
     * - скидає лічильник перепідключення, якщо він був запущений.
     */
    function initWsClient() {
        console.info('Closing previous connection if any and setting new WebSocket client.');
        closePreviousConnection();

        // Скидаємо можливий таймер перепідключення
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }

        if (!$AuthorizationToken.value) {
            // Немає токена — вимикаємо клієнт
            console.info('No token found. Closing previous connection if any.');
            wsClientRef.value = null;
            return;
        }

        // Створюємо новий WebSocket-клієнт
        const { client, close } = createWsClient({
            wsEndpoint,
            token: $AuthorizationToken.value,
            pingPongId: pingPongId.value,
            onError: () => {
                // Якщо виникла помилка, ставимо перепідключення через 5 секунд (тільки один раз!)
                if (!reconnectTimer) {
                    reconnectTimer = setTimeout(() => {
                        reconnectTimer = null;
                        initWsClient(); // повторна спроба
                    }, 5000);
                }
            }
        });

        closePreviousConnection = close;
        wsClientRef.value = client;
    }

    // Ініціалізуємо WS при зміні токена та після ініціалізації юзера
    watch(
        [() => $AuthorizationToken.value, () => $isUserInitialized.value],
        () => {
            if (!import.meta.client || !$isUserInitialized.value) return;
            initWsClient();
        },
        { immediate: true }
    );

    if (import.meta.client) {
        // Закриваємо при вивантаженні сторінки
        window.addEventListener('beforeunload', () => {
            console.info('Page unloading. Closing WebSocket connection.');
            closePreviousConnection();
        });

        // При відновленні інтернету одразу перепідключаємось
        window.addEventListener('online', () => {
            console.info('Browser is online. Attempting to reconnect WebSocket.');
            initWsClient();
        });
        // offline
        window.addEventListener('offline', () => {
            console.info('Browser is offline. Closing WebSocket connection.');
            closePreviousConnection();
        });
    }

    return {
        provide: {
            wsClient: wsClientRef,
            pingPongId,
        },
    };
});

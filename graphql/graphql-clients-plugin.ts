import { Chain, Subscription } from '~/graphql/zeus';
import { v4 } from 'uuid';
export default defineNuxtPlugin((nuxtApp) => {

    const config = useRuntimeConfig();
    const apiEndpoint = config.public.severHost;
    const wsEndpoint = config.public.wsHost;

    const AuthorizationToken = useCookie('Authorization', {
        secure: true,
        httpOnly: false,
        sameSite: 'lax',
        domain: 'app.keysharer.com',
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        path: "/",
    });

    const wsClientRef = ref<ReturnType<typeof Subscription> | null>(null);
    let closePreviousConnection: () => void = () => { };
    const initWsClient = () => {
        closePreviousConnection();
        if (!AuthorizationToken.value) {
            wsClientRef.value = null;
            return;
        }
        wsClientRef.value = Subscription(wsEndpoint, {
            get headers() {
                return {
                    'Content-Type': 'application/json',
                    Authorization: AuthorizationToken.value || '',
                    'sessionIdentifier': v4().toString(),
                };
            },
        });
        const connection = wsClientRef.value('subscription')({
            wsConnectionInitial: true,
        });
        closePreviousConnection = () => connection.ws.close();
    }
    watch(() => AuthorizationToken.value, () => {
        if (!import.meta.client) return;
        initWsClient();
    }, { immediate: true });

    const apiClient = Chain(apiEndpoint, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: AuthorizationToken.value || '',
        },
        credentials: 'include',
    });


    const postGQFormDataRequest = async (query: string, variables: {
        [key: string]: any
    }) => {
        const formData = new FormData();

        // Construct the operations object
        const operations = JSON.stringify({
            query,
            variables: { ...variables },
        });
        formData.append('operations', operations);

        // Build the map for file uploads
        const map = {};
        let fileIndex = 0;

        // Traverse the variables and append files if found
        const traverseVariables = (obj: any, path = 'variables') => {
            for (const key in obj) {
                const fullPath = `${path}.${key}`;
                if (obj[key] instanceof File || obj[key] instanceof Blob) {
                    //@ts-ignore
                    map[fileIndex] = [fullPath];
                    formData.append(fileIndex.toString(), obj[key]);
                    fileIndex++;
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    traverseVariables(obj[key], fullPath);
                }
            }
        };

        traverseVariables(variables);
        formData.append('map', JSON.stringify(map));

        // Send POST request
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
            },
            credentials: 'include',
            body: formData,
        });

        const result = await response.json();

        if (!response.ok || result.errors) {
            throw result;
        }

        return result;
    };


    return {
        provide: {
            gqClient: apiClient,
            wsClient: wsClientRef,
            postGQFormDataRequest,
            AuthorizationToken
        },
    };
});

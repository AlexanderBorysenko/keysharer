import { Chain } from '~/graphql/zeus';

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig();
    const apiEndpoint = config.public.severHost;

    const headers = import.meta.server ? (useRequestHeaders(['cookie']) || {}) : {};
    const apiClient = Chain(apiEndpoint, {
        headers: {
            ...headers,
            'Content-Type': 'application/json',
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
            // wsClient: wsClientRef,
            postGQFormDataRequest,
        },
    };
});

export const useApi = () => {
    const config = useRuntimeConfig()

    const baseURL = config.public.API_BASE;

    const token = localStorage.getItem('access_token') || '';

    const params: any = {};

    const combineWithCriticalFetchOptions = (options: any) => {
        return {
            baseURL,
            credentials: 'include' as RequestCredentials,
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'Access-Control-Allow-Origin': '*',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options?.headers,
            },
            params: {
                ...params,
                ...options?.params,
            },
        };
    }

    const api = <ReturnData>(
        request: Parameters<typeof $fetch>[0],
        options: Parameters<typeof $fetch>[1] = {}
    ) => {
        return $fetch<ReturnData>(request, combineWithCriticalFetchOptions(options));
    };

    const apiSS = <ReturnData>(
        request: Parameters<typeof useFetch>[0],
        options: Parameters<typeof useFetch>[1] = {}
    ) => {
        return useFetch<ReturnData>(
            request,
            combineWithCriticalFetchOptions(options)
        );
    }

    return { api, apiSS };
};
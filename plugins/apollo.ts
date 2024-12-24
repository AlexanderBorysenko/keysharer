import { defineNuxtPlugin } from '#app'
import { ApolloClient, InMemoryCache, split } from '@apollo/client/core'
import { createHttpLink } from '@apollo/client/link/http'
import { getMainDefinition } from '@apollo/client/utilities'
import { setContext } from '@apollo/client/link/context'
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { watch, ref } from 'vue'
import { v4 } from 'uuid'
import { createClient } from 'graphql-ws'

export default defineNuxtPlugin(() => {
    const { $AuthorizationToken, $isUserInitialized } = useNuxtApp();
    const wsErrorOccurred = ref(false);

    const onWsErrorResolvedCallbacks: Array<() => void> = [];
    const onWsErrorResolved = (callback: () => void) => {
        onWsErrorResolvedCallbacks.push(callback);
    }
    const removeOnWsErrorResolved = (callback: () => void) => {
        const index = onWsErrorResolvedCallbacks.indexOf(callback);
        if (index !== -1) {
            onWsErrorResolvedCallbacks.splice(index, 1);
        }
    }
    const resolveWsError = () => {
        console.log('WebSocket connection restored.', wsErrorOccurred.value);
        if (!wsErrorOccurred.value) return;
        wsErrorOccurred.value = false;
        onWsErrorResolvedCallbacks.forEach(cb => cb());
    }

    const pingPongId = ref<string>(v4())
    const config = useRuntimeConfig()

    const httpLink = createHttpLink({ uri: config.public.severHost })
    const authLink = setContext((_, { headers }) => ({
        headers: {
            ...headers,
            Authorization: $AuthorizationToken.value,
            pingPongId: pingPongId.value
        }
    }))

    let apolloClient: Ref<ApolloClient<any> | null> = ref(null)
    let wsLink: GraphQLWsLink | null = null

    function createWsLink(token: string) {
        return new GraphQLWsLink(createClient({
            url: config.public.wsHost,
            disablePong: true,
            retryAttempts: Infinity,
            shouldRetry: () => true,
            connectionParams: {
                Authorization: token,
                pingPongId: pingPongId.value,
            },
            retryWait: async () => {
                await new Promise(resolve => setTimeout(resolve, 2500));
                return;
            },
            on: {
                error: () => {
                    wsErrorOccurred.value = true;
                },
                opened: () => {
                    resolveWsError();
                },
            },
        }));
    }

    function initApollo(token: string) {
        if (!token) return null
        // close previous connection
        wsLink?.client.dispose();
        apolloClient.value = null

        wsLink = createWsLink(token)
        apolloClient.value = new ApolloClient({
            link: split(
                ({ query }) => {
                    const definition = getMainDefinition(query)
                    return (
                        definition.kind === 'OperationDefinition' &&
                        definition.operation === 'subscription'
                    )
                },
                wsLink,
                authLink.concat(httpLink)
            ),
            cache: new InMemoryCache()
        })
    }

    watch(
        [() => $AuthorizationToken.value, () => $isUserInitialized.value],
        () => {
            if (!import.meta.client || !$isUserInitialized.value) return
            initApollo($AuthorizationToken.value || '')
        },
        { immediate: true }
    )

    return {
        provide: {
            apollo: apolloClient,
            pingPongId,
            onWsErrorResolved,
            removeOnWsErrorResolved
        }
    }
})

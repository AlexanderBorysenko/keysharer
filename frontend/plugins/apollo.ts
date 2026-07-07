import { defineNuxtPlugin } from '#app'
import { ApolloClient, ApolloLink, InMemoryCache, split } from '@apollo/client/core'
import { createHttpLink } from '@apollo/client/link/http'
import { getMainDefinition } from '@apollo/client/utilities'
import { setContext } from '@apollo/client/link/context'
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { watch, ref } from 'vue'
import { createClient } from 'graphql-ws'

import { typedGql } from "~/graphql/zeus/typedDocumentNode";
import { type GenericOperation, type ModelTypes, type ValueTypes } from "~/graphql/zeus";
import { handleUnauthenticatedError } from '~/graphql/utils/handleUnauthenticatedError'


export default defineNuxtPlugin(() => {
    const { $AuthorizationToken, $isUserInitialized, $isWsConnected } = useNuxtApp();
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

    const config = useRuntimeConfig()

    const httpLink = createHttpLink({
        uri: config.public.severHost,
        credentials: 'include',
    })

    let apolloClient: Ref<ApolloClient<any> | null> = ref(null)
    let wsLink: GraphQLWsLink | null = null
    let authLink: ApolloLink | null = null

    const getAuthorizationHeaders = () => ({
        Authorization: `Bearer ${$AuthorizationToken.value}`,
    })
    function createAuthLink(token: string) {
        return setContext((_, { headers }) => ({
            headers: {
                ...headers,
                ...getAuthorizationHeaders(),
            },
        }));
    }
    function createWsLink(token: string) {
        return new GraphQLWsLink(createClient({
            url: config.public.wsHost,
            keepAlive: 10000,
            retryAttempts: Infinity,
            shouldRetry: () => true,
            connectionParams: () => ({
                ...getAuthorizationHeaders(),
            }),
            retryWait: async () => {
                await new Promise(resolve => setTimeout(resolve, 2500));
                return;
            },
            on: {
                error: () => {
                    wsErrorOccurred.value = true;
                },
                closed: () => {
                    wsErrorOccurred.value = true;
                },
                opened: () => {
                    resolveWsError();
                },
            },
        }));
    }

    function initApollo(token: string) {
        const previousWsLink = wsLink

        const newWsLink = createWsLink(token)
        authLink = createAuthLink(token)
        const newApolloClient = new ApolloClient({
            link: split(
                ({ query }) => {
                    const definition = getMainDefinition(query)
                    return (
                        definition.kind === 'OperationDefinition' &&
                        definition.operation === 'subscription'
                    )
                },
                newWsLink,
                authLink.concat(httpLink)
            ),
            cache: new InMemoryCache(),
            defaultOptions: {
                watchQuery: {
                    fetchPolicy: 'no-cache',
                    errorPolicy: 'ignore',
                },
                query: {
                    fetchPolicy: 'no-cache',
                    errorPolicy: 'all',
                },
            }
        });

        // swap in the new client/link first so `$isWsConnected` never flaps to
        // false during a token-refresh rebuild, then dispose the old connection
        wsLink = newWsLink
        apolloClient.value = newApolloClient
        previousWsLink?.client.dispose();
    }

    watch(
        [() => $AuthorizationToken.value, () => $isUserInitialized.value],
        () => {
            initApollo($AuthorizationToken.value || '')
        },
        { immediate: true }
    )

    watch(() => apolloClient.value, (
        client
    ) => {
        if (!client) $isWsConnected.value = false
        else $isWsConnected.value = true
    })

    const executeQuery = async <
        R extends keyof ValueTypes = GenericOperation<"query">,
        QueryKey extends keyof ValueTypes[R] = keyof ValueTypes[R]
    >(
        query: { [P in QueryKey]: ValueTypes[R][P] }
    ) => {
        if (!apolloClient.value) throw new Error('Apollo client is not initialized')
        const { data, errors } = await apolloClient.value.query({
            query: typedGql('query')(query as any)
        });
        if (errors?.length) {
            handleUnauthenticatedError(errors)
        }

        return {
            data: deepObjectCopy<ModelTypes[R][QueryKey]>(data[Object.keys(query)[0]]),
            errors
        }
    }
    const executeMutation = async <
        R extends keyof ValueTypes = GenericOperation<"mutation">,
        MutationKey extends keyof ValueTypes[R] = keyof ValueTypes[R]
    >(
        mutation: { [P in MutationKey]: ValueTypes[R][P] }
    ) => {
        if (!apolloClient.value) throw new Error('Apollo client is not initialized')
        const { data, errors } = await apolloClient.value.mutate({
            mutation: typedGql('mutation')(mutation as any)
        });
        if (errors?.length) {
            handleUnauthenticatedError(errors)
        }

        return {
            data: deepObjectCopy<ModelTypes[R][MutationKey]>(data),
            errors
        }
    }

    const useSubscription = <
        R extends keyof ValueTypes = GenericOperation<"subscription">,
        SubscriptionKey extends keyof ValueTypes[R] = keyof ValueTypes[R],
    >(
        subscription: { [P in SubscriptionKey]: ValueTypes[R][P] }
    ) => {
        const callbacks: Array<(payload: ValueTypes[R][SubscriptionKey]) => void> = [];
        const on = (callback: (payload: ModelTypes[R][SubscriptionKey]) => void) => {
            callbacks.push(callback);
        };
        const off = (callback: (payload: ModelTypes[R][SubscriptionKey]) => void) => {
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        };

        const stop = ref(false);
        let activeSubscriptionHandle: { unsubscribe: () => void } | null = null;
        const unsubscribeActive = () => {
            activeSubscriptionHandle?.unsubscribe();
            activeSubscriptionHandle = null;
        };
        const stopSubscription = () => {
            stop.value = true;
            callbacks.splice(0, callbacks.length);
            unsubscribeActive();
        };

        watch(
            [() => apolloClient.value, () => $isUserInitialized.value],
            () => {
                // tear down the previous live subscription before creating a
                // new one (on client rebuild) or leaving one running (teardown)
                unsubscribeActive();

                if (!apolloClient.value || !$isUserInitialized.value) return;
                const query = typedGql('subscription')(subscription as any);

                const subscriptionInstance = apolloClient.value.subscribe({
                    query,
                });
                activeSubscriptionHandle = subscriptionInstance.subscribe({
                    next: (payload) => {
                        if (stop.value) return;
                        const subscriptionKey = Object.keys(subscription)[0];
                        // @ts-ignore
                        callbacks.forEach((cb) => cb(payload.data[subscriptionKey]));
                    },
                    error: (error) => {
                        console.error('Subscription error:', error);
                        // reconcile state via the same catch-up path used for reconnects
                        wsErrorOccurred.value = true;
                    },
                    complete: () => {
                        console.log('Subscription completed.');
                    },
                });
            },
            { immediate: true }
        );

        return {
            on,
            off,
            stopSubscription,
        };
    };


    return {
        provide: {
            apollo: apolloClient,
            getAuthorizationHeaders,
            executeQuery,
            executeMutation,
            onWsErrorResolved,
            removeOnWsErrorResolved,
            useSubscription
        }
    }
})

import { defineNuxtPlugin } from '#app'
// Apollo Client 4 reorganized entry points: `@apollo/client/core` is still a
// valid subpath (its `.` root re-exports the same thing), but the bare link
// helper functions (`split`, `from`, `concat`) moved to static `ApolloLink.*`
// methods, and `createHttpLink` is superseded by the `HttpLink` class.
import { ApolloClient, ApolloLink, InMemoryCache, HttpLink } from '@apollo/client/core'
import { getMainDefinition } from '@apollo/client/utilities'
import { setContext } from '@apollo/client/link/context'
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { watch, ref } from 'vue'
import { createClient } from 'graphql-ws'

import { typedGql } from "~/graphql/zeus/typedDocumentNode";
import { type GenericOperation, type ModelTypes, type ValueTypes } from "~/graphql/zeus";
import { handleUnauthenticatedError } from '~/graphql/utils/handleUnauthenticatedError'

// Apollo Client 4 requires default `errorPolicy` values to be declared at the
// type level, so that `client.query`/`watchQuery` result types correctly
// reflect that `data` can be partial/undefined under that policy. This must
// mirror the `defaultOptions` passed to `new ApolloClient(...)` below.
declare module '@apollo/client/core' {
    namespace ApolloClient {
        namespace DeclareDefaultOptions {
            interface WatchQuery {
                errorPolicy: 'ignore'
            }
            interface Query {
                errorPolicy: 'all'
            }
        }
    }
}

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

    const httpLink = new HttpLink({
        uri: config.public.severHost,
        credentials: 'include',
    })

    // v4 dropped the `TCacheShape` generic from `ApolloClient` (it added
    // little type safety and everyone set it to `any` anyway).
    let apolloClient: Ref<ApolloClient | null> = ref(null)
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
            link: ApolloLink.split(
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

    // Apollo Client 4 unifies GraphQL + network errors into a single `error`
    // field on query/mutate results (replacing v3's `errors` array). Convert
    // back to an array here so downstream consumers of executeQuery/executeMutation
    // (handleUnauthenticatedError, fetchChatState.ts's `errors?.length` check,
    // getGQErrorMessage) keep working against the same shape as before.
    const toErrorsArray = (error: unknown): any[] | undefined => {
        if (!error) return undefined
        if (CombinedGraphQLErrors.is(error)) return [...error.errors]
        return [error]
    }

    const executeQuery = async <
        R extends keyof ValueTypes = GenericOperation<"query">,
        QueryKey extends keyof ValueTypes[R] = keyof ValueTypes[R]
    >(
        query: { [P in QueryKey]: ValueTypes[R][P] }
    ) => {
        if (!apolloClient.value) throw new Error('Apollo client is not initialized')
        const { data, error } = await apolloClient.value.query({
            query: typedGql('query')(query as any)
        });
        const errors = toErrorsArray(error);
        if (errors?.length) {
            handleUnauthenticatedError(errors)
        }

        return {
            data: deepObjectCopy<ModelTypes[R][QueryKey]>(data?.[Object.keys(query)[0]]),
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
        const { data, error } = await apolloClient.value.mutate({
            mutation: typedGql('mutation')(mutation as any)
        });
        const errors = toErrorsArray(error);
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
                    // Apollo Client 4 routes ALL subscription errors (including
                    // what used to reach the observer's `error` callback) through
                    // `next`'s `result.error` instead, so the observable never
                    // terminates on a network error. Check it here first to
                    // preserve the Task 2 catch-up-refetch behavior.
                    next: (result) => {
                        if (stop.value) return;
                        if (result.error) {
                            console.error('Subscription error:', result.error);
                            // reconcile state via the same catch-up path used for reconnects
                            wsErrorOccurred.value = true;
                            return;
                        }
                        const subscriptionKey = Object.keys(subscription)[0];
                        // @ts-ignore
                        callbacks.forEach((cb) => cb(result.data[subscriptionKey]));
                    },
                    // Kept as a safety net: v4 no longer delivers subscription
                    // errors here (see `next` above), but this stays wired in
                    // case anything still surfaces through it.
                    error: (error) => {
                        console.error('Subscription error:', error);
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

import { handleUnauthenticatedError } from "~/graphql/utils/handleUnauthenticatedError";
import { Role, type ModelTypes, type ValueTypes } from "~/graphql/zeus";
import { typedGql } from "~/graphql/zeus/typedDocumentNode";
import { useChatStore } from "~/modules/chats/store/useChatStore";

const useUserStore = defineStore('userStore', () => {
    const {
        $apollo,
        $AuthorizationToken,
        $isUserInitialized,
        $isUserAuthorized,
        $useSubscription: useSubscription,
        $pingPongId
    } = useNuxtApp();
    const chatStore = useChatStore();

    const {
        on: onPing,
    } = useSubscription({
        onlineServerPing: [{
            pingPongId: $pingPongId.value
        }, true]
    });
    onPing((pingPongIterationId: string) => {
        $apollo.value?.mutate({
            mutation: typedGql('mutation')({
                onlineServerPong: [{
                    input: {
                        pingPongId: $pingPongId.value,
                        pingPongIterationId
                    }
                }, true]
            })
        })
    })

    const router = useRouter();

    const userInitialState: ModelTypes['User'] = {
        id: '',
        username: '',
        avatar: null,
        displayName: null,
        email: null,
        emailVerified: null,
        isOnline: null,
        role: Role.GUEST,
    }
    const state = reactive<ModelTypes['User']>(userInitialState);

    const isUserSubscribed = ref(true);

    const registerRequest = async (data: ModelTypes['CreateUserInput']) => {
        await $apollo.value?.mutate({
            mutation: typedGql('mutation')({
                createUser: [
                    { input: data },
                    {
                        id: true,
                    }
                ],
            })
        });
    };

    const login = async (data: ModelTypes['LoginUserInput']) => {
        $isUserInitialized.value = false;
        try {
            const response = await $apollo.value?.mutate({
                mutation: typedGql('mutation')({
                    loginUser: [
                        { input: data },
                        {
                            user: {
                                id: true, username: true, avatar: true, displayName: true, email: true, emailVerified: true, isOnline: true, role: true,
                            },
                            token: true,
                        }
                    ],
                })
            });

            const loginUser = response?.data?.loginUser;
            if (!loginUser) throw new Error('no valid data in response');

            $AuthorizationToken.value = loginUser.token;
            Object.assign(state, loginUser.user);
            $isUserInitialized.value = true;
            $isUserAuthorized.value = true;
            return true;
        } catch (err) {
            console.error('Failed to login:', err);
            return false;
        }
    }

    const logout = async () => {
        $AuthorizationToken.value = '';
        Object.assign(state, userInitialState);
        chatStore.setChat(null);
        $isUserInitialized.value = false;
        await $apollo.value?.mutate({
            mutation: typedGql('mutation')({
                logoutUser: true,
            })
        });
        if (!router.currentRoute.value.path.includes('login') && location) {
            // location.href = '/login';
            router.push('/login');
        }
    }

    const initializeUser = async () => {
        $isUserInitialized.value = false;
        try {
            if (!$AuthorizationToken.value) throw new Error('No token');
            if (!$apollo.value) throw new Error('Apollo client is not initialized');
            const result = await $apollo.value?.query({
                query: typedGql('query')({
                    me: {
                        id: true, username: true, avatar: true, displayName: true, email: true, emailVerified: true, isOnline: true,
                    },
                })
            });
            const me = result?.data?.me;
            if (!me) throw new Error('No valid data in response');

            Object.assign(state, me);
            $isUserInitialized.value = true;
        } catch (err) {
            console.error('Failed to initialize user:', err);
            await logout();
        }
    }

    const refreshToken = async () => {
        console.log('Execute refresh token');
        try {
            if (!$AuthorizationToken.value) return;
            const response = await $apollo.value?.mutate({
                mutation: typedGql('mutation')({
                    refreshToken: {
                        token: true,
                    },
                })
            });
            const refreshToken = response?.data?.refreshToken;
            if (!refreshToken) throw new Error('No valid data in response');
            $AuthorizationToken.value = refreshToken.token;
        } catch (err) {
            console.error('Failed to refresh token:', err);
            handleUnauthenticatedError(err);
        }
    }

    const { on: onUserUpdated } = useSubscription({
        userUpdated: {
            id: true, username: true, avatar: true, displayName: true, email: true, emailVerified: true, isOnline: true
        }
    })
    onUserUpdated((user) => {
        if (user.id === state.id) {
            Object.assign(state, user);
        }
    });

    return {
        state,
        isUserSubscribed,
        logout,
        login,
        refreshToken,
        registerRequest,
        initializeUser,
    };
});

export default useUserStore;

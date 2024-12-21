import { handleUnauthenticatedError } from "~/graphql/utils/handleUnauthenticatedError";
import { Role, type ModelTypes, type ValueTypes } from "~/graphql/zeus";
import { useChatStore } from "~/modules/chats/store/useChatStore";

const useUserStore = defineStore('userStore', () => {
    const {
        $gqClient,
        $AuthorizationToken,
        $isUserInitialized
    } = useNuxtApp();
    const chatStore = useChatStore();

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
        await $gqClient('mutation')({
            createUser: [
                { input: data },
                {
                    id: true,
                }
            ],
        });
    };

    const login = async (data: ModelTypes['LoginUserInput']) => {
        $isUserInitialized.value = false;
        try {
            const { loginUser } = await $gqClient('mutation')({
                loginUser: [
                    { input: data },
                    {
                        user: {
                            id: true, username: true, avatar: true, displayName: true, email: true, emailVerified: true, isOnline: true, role: true,
                        },
                        token: true,
                    }
                ],
            });

            $AuthorizationToken.value = loginUser.token;
            Object.assign(state, loginUser.user);
            $isUserInitialized.value = true;
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
        await $gqClient('mutation')({
            logoutUser: true,
        });
        if (!router.currentRoute.value.path.includes('login')) {
            location.href = '/login';
        }
    }

    const initializeUser = async () => {
        $isUserInitialized.value = false;
        try {
            if (!$AuthorizationToken.value) throw new Error('No token');
            await refreshToken();
            const result = await $gqClient('query')({
                me: {
                    id: true, username: true, avatar: true, displayName: true, email: true, emailVerified: true, isOnline: true,
                },
            });
            Object.assign(state, result.me);
            $isUserInitialized.value = true;
        } catch (err) {
            await logout();
        }
    }

    const refreshToken = async () => {
        console.log('Execute refresh token');
        try {
            if (!$AuthorizationToken.value) return;
            const { refreshToken } = await $gqClient('mutation')({
                refreshToken: {
                    token: true,
                },
            });
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

import { Role, type ModelTypes, type ValueTypes } from "~/graphql/zeus";
import { useChatStore } from "~/modules/chats/store/useChatStore";

const useUserStore = defineStore('userStore', () => {
    const {
        $gqClient,
        $AuthorizationToken
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
        console.log('login', data);
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

            return true;
        } catch (err) {
            console.error('Failed to login:', err);
            return false;
        }
    }

    const logout = () => {
        console.log('logout!');
        $AuthorizationToken.value = '';
        Object.assign(state, userInitialState);

        chatStore.setChat(null);
        if (!router.currentRoute.value.path.includes('login')) {
            router.push('/login');
        }
    }

    const initializeUser = async () => {
        try {
            const result = await $gqClient('query')({
                me: {
                    id: true, username: true, avatar: true, displayName: true, email: true, emailVerified: true, isOnline: true,
                },
            });
            Object.assign(state, result.me);
        } catch (err) {
            console.error('Failed to initialize user:', err);
            logout();
        }
    }

    const refreshToken = async () => {
        try {
            const { refreshToken } = await $gqClient('mutation')({
                refreshToken: {
                    token: true,
                },
            });
            $AuthorizationToken.value = refreshToken.token;
        } catch (err) {
            console.error('Failed to refresh token:', err);
            logout();
        }
    }

    const { on: onUserUpdated } = useSubscription({
        userUpdated: {
            id: true, username: true, avatar: true, displayName: true, email: true, emailVerified: true, isOnline: true
        }
    })
    onUserUpdated((user) => {
        console.log('user updated', user);
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

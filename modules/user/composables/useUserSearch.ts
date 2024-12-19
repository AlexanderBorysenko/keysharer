import type { ModelTypes } from "~/graphql/zeus";
import type { TUser } from "~/modules/user/types/TUser"

const useUserSearch = () => {
    const {
        $gqClient
    } = useNuxtApp();

    const search = ref('')

    const result = ref<ModelTypes['User'][]>([]);

    const executeSearch = async (
        request: string
    ) => {
        if (!request) {
            result.value = [];
            return;
        }
        if (search.value.length < 4) return;

        const response = await $gqClient('query')({
            users: [
                {
                    input: { search: request }
                },
                {
                    id: true,
                    avatar: true,
                    username: true,
                    displayName: true,
                    email: true,
                    emailVerified: true,
                    isOnline: true,
                }
            ]
        })

        result.value = response.users
    }
    watch(search, executeSearch);

    return {
        search,
        result,
    }
}

export default useUserSearch
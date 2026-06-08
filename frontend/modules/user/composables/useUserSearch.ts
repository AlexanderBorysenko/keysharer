import type { ModelTypes } from "~/graphql/zeus";
import { typedGql } from "~/graphql/zeus/typedDocumentNode";

const useUserSearch = ({
    exclude
}: {
    exclude?: string[]
} = {}) => {
    const {
        $executeQuery
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
        if (search.value[0] === '@') {
            request = request.slice(1)
        }

        const { data: users } = await $executeQuery({
            users: [
                {
                    input: {
                        search: request,
                        excludeUserIds: exclude || []
                    }
                },
                {
                    id: true,
                    avatar: true,
                    username: true,
                    displayName: true,
                    email: true,
                    emailVerified: true,
                    isOnline: true,
                    role: true,
                }
            ]
        });

        result.value = deepObjectCopy(users);
    }
    watch(search, executeSearch);

    return {
        search,
        result,
    }
}

export default useUserSearch
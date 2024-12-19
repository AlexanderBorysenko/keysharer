import { handleUnauthenticatedError } from "~/graphql/utils/handleUnauthenticatedError";
import { useChatStore } from "./useChatStore";

const useChatCreationStore = defineStore('chatCreationState', () => {
    const { $gqClient } = useNuxtApp();
    const { setChat } = useChatStore();

    const isChatCreationOpened = ref(false);

    const openChatCreation = () => {
        isChatCreationOpened.value = true;
    }

    const closeChatCreation = () => {
        isChatCreationOpened.value = false;
        targetUserId.value = null;
    }

    const targetUserId = ref<string | null>(null);

    const loading = ref(false);
    const createChat = async () => {
        if (loading.value || !targetUserId.value) return;
        loading.value = true;
        try {
            const response = await $gqClient('mutation')({
                createUserChat: [
                    {
                        input: {
                            userIds: [targetUserId.value]
                        }
                    },
                    {
                        id: true
                    }
                ]
            });

            setTimeout(() => {
                setChat(response.createUserChat.id);
            }, 10);
            closeChatCreation();
        } catch (e: any) {
            handleUnauthenticatedError(e);
            alert(`Failed to create chat. ${e.response.errors[0].message}`);
            console.error(e);
        } finally {
            loading.value = false;
        }
    }

    return {
        isChatCreationOpened,
        openChatCreation,
        closeChatCreation,
        targetUserId,
        createChat
    };
});

export default useChatCreationStore;
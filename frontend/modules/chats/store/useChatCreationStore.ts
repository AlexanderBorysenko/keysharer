import { handleUnauthenticatedError } from "~/graphql/utils/handleUnauthenticatedError";
import { useChatStore } from "./useChatStore";
import { typedGql } from "~/graphql/zeus/typedDocumentNode";
import { getGQErrorMessage } from "~/graphql/utils/getGQErrorMessage";

const useChatCreationStore = defineStore('chatCreationState', () => {
    const { $apollo } = useNuxtApp();
    const { setChat } = useChatStore();

    const isChatCreationOpened = ref(false);

    const openChatCreation = () => {
        isChatCreationOpened.value = true;
    }
    const notifications = useAppNotificationsStore();

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
            const response = await $apollo.value?.mutate({
                mutation: typedGql('mutation')({
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
                })
            });

            setTimeout(() => {
                if (!response?.data?.createUserChat.id) {
                    throw new Error('Failed to create chat');
                }
                setChat(response.data.createUserChat.id);
            }, 10);
            closeChatCreation();
        } catch (e: any) {
            handleUnauthenticatedError(e);
            notifications.addNotification({
                type: 'error',
                message: getGQErrorMessage(e)
            });
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
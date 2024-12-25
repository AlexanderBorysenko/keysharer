import { handleUnauthenticatedError } from "~/graphql/utils/handleUnauthenticatedError";
import { useChatStore } from "./useChatStore";
import { useAppNotificationsStore } from "~/stores/appNotificationsStore";

export const useChatDeletionStore = defineStore('chatDeletionStore', () => {
    const { $gqClient } = useNuxtApp();
    const chatStore = useChatStore();
    const appNotifications = useAppNotificationsStore();

    const isChatDeletionModalOpen = ref(false);

    const openChatDeletionModal = () => {
        isChatDeletionModalOpen.value = true;
    }

    const closeChatDeletionModal = () => {
        isChatDeletionModalOpen.value = false;
    }

    const loading = ref(false);
    const errors = ref<string[]>([]);

    const deleteChat = async () => {
        if (!chatStore.chatState.iAmAdmin) {
            appNotifications.addNotification({
                type: 'error',
                message: 'You are not the administrator of this chat'
            });
        }
        if (loading.value || !chatStore.chatState.id) return;
        loading.value = true;
        try {
            await $gqClient('mutation')({
                deleteChat: [
                    {
                        input: {
                            chatId: chatStore.chatState.id,
                        }
                    },
                    true
                ]
            });

            appNotifications.addNotification({
                type: 'success',
                message: 'Chat deleted successfully'
            });

            closeChatDeletionModal();
        } catch (e: any) {
            errors.value = e.response?.errors.map((err: any) => err.message) || ['Failed to delete chat'];
            handleUnauthenticatedError(e);
        } finally {
            loading.value = false;
        }
    };

    return {
        isChatDeletionModalOpen,
        openChatDeletionModal,
        closeChatDeletionModal,
        loading,
        errors,
        deleteChat
    };
});
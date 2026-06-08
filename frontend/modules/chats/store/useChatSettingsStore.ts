import { handleUnauthenticatedError } from '~/graphql/utils/handleUnauthenticatedError';
import { useChatStore } from './useChatStore';

export const useChatSettingsStore = defineStore('chatSettingsStore', () => {
    const { $postGQFormDataRequest } = useNuxtApp();
    const chatStore = useChatStore();
    const appNotifications = useAppNotificationsStore();

    const isSettingsModalOpen = ref(false);

    const openSettingsModal = () => {
        isSettingsModalOpen.value = true;
    }

    const closeSettingsModal = () => {
        isSettingsModalOpen.value = false;
    }

    const chatUpdateForm = ref<{
        name: string;
        avatar: File | null;
    }>({
        name: '',
        avatar: null
    });
    watch(() => chatStore.chatState, (newChatState) => {
        chatUpdateForm.value.name = chatStore.chatState.name;
        chatUpdateForm.value.avatar = null;
    }, { deep: true, immediate: true });

    const loading = ref(false);
    const errors = ref<string[]>([]);
    const updateChatSettings = async () => {
        loading.value = true;
        try {
            const response = await $postGQFormDataRequest(`
                mutation updateChat($input: UpdateChatInput!) {
                    updateChat(input: $input)
                }
            `, {
                input: {
                    id: chatStore.chatState.id ?? '',
                    name: chatUpdateForm.value.name,
                    avatar: chatUpdateForm.value.avatar // this is file
                }
            });

            appNotifications.addNotification({
                message: 'Chat settings updated',
                type: 'success',
                icon: 'success'
            });

            closeSettingsModal();
        } catch (error: any) {
            handleUnauthenticatedError(error);
            if (error.response?.errors.length) {
                errors.value = error.response.errors.map((e: any) => e.message);
            }
        } finally {
            loading.value = false;
        }
    }

    return {
        errors,
        chatUpdateForm,
        isSettingsModalOpen,
        openSettingsModal,
        closeSettingsModal,
        loading,
        updateChatSettings
    }
});
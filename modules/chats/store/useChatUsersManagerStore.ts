import { defineStore } from 'pinia';
import { useChatStore } from './useChatStore';
import { useAppNotificationsStore } from '~/stores/appNotificationsStore';
import { handleUnauthenticatedError } from '~/graphql/utils/handleUnauthenticatedError';
import { getGQErrorMessage } from '~/graphql/utils/getGQErrorMessage';

export const useChatUsersManagerStore = defineStore('chatUsersManagerStore', () => {
    const { $gqClient } = useNuxtApp();
    const chatStore = useChatStore();
    const appNotificationsStore = useAppNotificationsStore();

    const isChatUsersManagerModalOpen = ref(false);
    const openChatUsersManagerModal = () => {
        isChatUsersManagerModalOpen.value = true;
    }
    const closeChatUsersManagerModal = () => {
        isChatUsersManagerModalOpen.value = false;
        managerStage.value = 'list-users';
        userToAddId.value = null;
    }

    const managerStage = ref<'list-users' | 'add-user'>('list-users');

    const userToAddId = ref<string | null>(null);
    const addMember = async () => {
        if (!userToAddId.value) return;
        try {
            await $gqClient('mutation')({
                addUserToChat: [
                    {
                        input: {
                            chatId: chatStore.chatState.id,
                            userId: userToAddId.value
                        }
                    },
                    true
                ]
            });
            appNotificationsStore.addNotification({
                type: 'success',
                message: 'Member added successfully'
            });
            managerStage.value = 'list-users';
        } catch (e: any) {
            handleUnauthenticatedError(e);
            appNotificationsStore.addNotification({
                type: 'error',
                message: getGQErrorMessage(e)
            });
        } finally {
            userToAddId.value = null;
        }
    };

    const removeMember = async (userId: string) => {
        try {
            await $gqClient('mutation')({
                removeUserFromChat: [
                    {
                        input: {
                            chatId: chatStore.chatState.id,
                            userId
                        }
                    },
                    true
                ]
            });
            appNotificationsStore.addNotification({
                type: 'success',
                message: 'Member removed successfully'
            });
        } catch (e: any) {
            handleUnauthenticatedError(e);
            appNotificationsStore.addNotification({
                type: 'error',
                message: getGQErrorMessage(e)
            });
        }
    };

    return {
        addMember,
        removeMember,
        userToAddId,
        isChatUsersManagerModalOpen,
        openChatUsersManagerModal,
        closeChatUsersManagerModal,
        managerStage
    };
});
import { defineStore } from 'pinia'
import type { ModelTypes } from '~/graphql/zeus'

export const useUsersTypingStatusesStore = defineStore('usersTypingStatusesStore', () => {
    const typings: Ref<ModelTypes['UserTypingStatus'][]> = ref([]);

    const {
        onTyping
    } = useUserSubscriptionsStore();

    const findTypingStatusIndex = ({ userId, chatId }: {
        userId: string;
        chatId: string;
    }) => {
        return typings.value.findIndex(typing => typing.userId === userId && typing.chatId === chatId);
    }

    const updateTypingStatus = (typingStatus: ModelTypes['UserTypingStatus']) => {
        const existingTypingStatusIndex = findTypingStatusIndex(typingStatus);
        if (existingTypingStatusIndex === -1) {
            typings.value.push(typingStatus);
        } else {
            typings.value[existingTypingStatusIndex].isTyping = typingStatus.isTyping;
        }
    }

    const getChatTypingUserIds = (chatId: string) => {
        return typings.value
            .filter(typing => typing.chatId === chatId && typing.isTyping)
            .map(typing => typing.userId);
    }

    const getTypingUsers = (users: ModelTypes['User'][], chatId: string) => {
        return users.filter(user => getChatTypingUserIds(chatId).includes(user.id));
    }

    onTyping(updateTypingStatus);

    return {
        getChatTypingUserIds,
        getTypingUsers
    }
})
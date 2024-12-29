import { fetchChatState } from "../service/fetchChatState";
import { fetchChatMessagesPage } from "../service/fetchChatMessagesPage";
import type { ModelTypes } from "~/graphql/zeus";
import { getGQErrorMessage } from "~/graphql/utils/getGQErrorMessage";
import { typedGql } from "~/graphql/zeus/typedDocumentNode";
import { useUsersTypingStatusesStore } from "./useUsersTypingStatusesStore";

export const useChatStore = defineStore('chat', () => {
    const {
        onChatDeleted, onChatUpdated, onNewMessage, onTyping, onMessageUpdated,
    } = useUserSubscriptionsStore();
    const {
        $onWsErrorResolved,
        $apollo
    } = useNuxtApp();
    const userStore = useUserStore();
    const appNotificationsStore = useAppNotificationsStore();

    // Стан за змовчуванням
    const initialState: ModelTypes['Chat'] = {
        id: '',
        users: [],
        name: '',
        avatar: '',
        owner_id: '',
        updated_at: '',
        iAmAdmin: false,
        unread_messages_count: 0,
        messages: [],
    };

    // Реактивний стан поточного чату, який експортується і використовується в компонентах 
    const chatState = reactive<ModelTypes['Chat']>(deepObjectCopy(initialState));

    const isLoadingChat = ref(false);
    const isOpened = ref(false);
    const isLoadingMoreMessages = ref(false);
    const isLastPage = ref(false);

    const resetChatState = () => {
        Object.assign(chatState, deepObjectCopy(initialState));
    };

    const close = () => {
        isOpened.value = false;
        isLoadingChat.value = false;
        resetChatState();
    };

    const updateChatState = (chatUpdated: ModelTypes['Chat']) => {
        if (chatUpdated.id !== chatState.id) return;
        Object.assign(chatState, chatUpdated);
    };

    const handleChatDeleted = (chatDeletedId: string) => {
        if (chatDeletedId !== chatState.id) return;
        close();
    };

    const addNewMessage = (newMessage: any) => {
        if (newMessage.chat_id !== chatState.id) return;
        chatState.messages?.push(newMessage);
    };

    const updateMessage = (messageUpdated: ModelTypes['Message']) => {
        if (messageUpdated.chat_id !== chatState.id || !chatState.messages) return;
        const index = chatState.messages.findIndex(message => message.id === messageUpdated.id);
        if (index !== -1) chatState.messages[index] = messageUpdated;
    };

    onChatUpdated(updateChatState);
    onChatDeleted(handleChatDeleted);
    onNewMessage(addNewMessage);

    onMessageUpdated(updateMessage);

    const setChat = async (chatId: string | null) => {
        if (!chatId) {
            Object.assign(chatState, initialState);
            close();
            return;
        }
        isLoadingChat.value = true;
        isOpened.value = true;
        isLastPage.value = false;
        isLoadingMoreMessages.value = false;

        const state = await fetchChatState(chatId);
        Object.assign(chatState, state);

        loadInitialMessages();
        isLoadingChat.value = false;
    };
    $onWsErrorResolved(() => {
        if (chatState.id)
            setChat(chatState.id);
    });

    const getChatUser = (userId: string) => {
        return chatState.users?.find(user => user.id === userId);
    }

    const lastMessageId = computed(() => chatState.messages?.length ? chatState.messages[0].id : null);

    const currentInitialMessagesChatLoadingId = ref<string | null>('');
    const isLoadingInitialMessages = computed(() => chatState.id === currentInitialMessagesChatLoadingId.value);

    const loadInitialMessages = async () => {
        if (!chatState.id) return;
        currentInitialMessagesChatLoadingId.value = chatState.id;
        try {
            const messages = await fetchChatMessagesPage(chatState.id, null);

            // Перевірка, чи чат не змінився під час завантаження повідомлень
            if (currentInitialMessagesChatLoadingId.value !== chatState.id) return;

            chatState.messages = messages;
            isLastPage.value = messages.length < 1;
        } catch (error) {
            appNotificationsStore.addNotification({
                type: 'error',
                message: getGQErrorMessage(error)
            });
        } finally {
            if (currentInitialMessagesChatLoadingId.value === chatState.id)
                currentInitialMessagesChatLoadingId.value = null;
        }
    }

    const loadMoreMessages = async () => {
        if (isLoadingMoreMessages.value || isLoadingInitialMessages.value || !chatState.id || isLastPage.value) return;
        isLoadingMoreMessages.value = true;
        try {
            const messages = await fetchChatMessagesPage(chatState.id, lastMessageId.value);
            chatState.messages?.unshift(...messages);
            isLastPage.value = messages.length < 1;
        } catch (error) {
            console.error(error);
        } finally {
            isLoadingMoreMessages.value = false;
        }
    };

    const leaveChat = async () => {
        if (!chatState.id) return;
        try {
            if (!$apollo.value) throw new Error('Apollo client is not initialized');
            await $apollo.value.mutate({
                mutation: typedGql('mutation')({
                    removeUserFromChat: [{
                        input: {
                            chatId: chatState.id,
                            userId: userStore.state.id || ''
                        }
                    }, true]
                })
            });
            close();
        } catch (error) {
            appNotificationsStore.addNotification({
                type: 'error',
                message: getGQErrorMessage(error)
            });
        }
    }

    const { getTypingUsers } = useUsersTypingStatusesStore();
    const typingUsers = computed(
        () => getTypingUsers(chatState.users || [], chatState.id) || []
    );

    const typingStatus = computed(() => {
        if (typingUsers.value.length === 0) return '';
        if (typingUsers.value.length === 1)
            return `${typingUsers.value[0].displayName} is typing...`;
        return 'Several people are typing...';
    });

    return {
        isOpened,
        close,
        chatState,
        setChat,
        getChatUser,
        loadMoreMessages,
        isLoadingMoreMessages,
        isLoadingInitialMessages,
        isLoadingChat,
        isLastPage,
        typingStatus,
        leaveChat
    };
});

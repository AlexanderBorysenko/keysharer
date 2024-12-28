import { fetchChatState } from "../service/fetchChatState";
import { fetchChatMessagesPage } from "../service/fetchChatMessagesPage";
import type { ModelTypes } from "~/graphql/zeus";
import { getGQErrorMessage } from "~/graphql/utils/getGQErrorMessage";
import { typedGql } from "~/graphql/zeus/typedDocumentNode";

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
    const chatState = reactive<ModelTypes['Chat']>(deepObjectCopy(initialState));

    const typingUserIds = ref<string[]>([]);
    const updateUserTyping = (userId: string, isTyping: boolean) => {
        if (isTyping) {
            typingUserIds.value.push(userId);
        } else {
            const index = typingUserIds.value.indexOf(userId);
            if (index !== -1) typingUserIds.value.splice(index, 1);
        }
    }
    const typingUsers = computed(() => chatState.users?.filter(user => typingUserIds.value.includes(user.id)) || []);

    const isLoadingChat = ref(false);
    const isOpened = ref(false);
    const isLoadingMoreMessages = ref(false);
    const isLastPage = ref(false);

    const resetChatState = () => {
        Object.assign(chatState, deepObjectCopy(initialState));
        typingUserIds.value = [];
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

    const updateTypingStatus = (typing: { chatId: string, userId: string, isTyping: boolean }) => {
        if (typing.chatId !== chatState.id) return;
        updateUserTyping(typing.userId, typing.isTyping);
    };

    const updateMessage = (messageUpdated: ModelTypes['Message']) => {
        if (messageUpdated.chat_id !== chatState.id || !chatState.messages) return;
        const index = chatState.messages.findIndex(message => message.id === messageUpdated.id);
        if (index !== -1) chatState.messages[index] = messageUpdated;
    };

    onChatUpdated(updateChatState);
    onChatDeleted(handleChatDeleted);
    onNewMessage(addNewMessage);
    onTyping(updateTypingStatus);
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
        try {
            const state = await fetchChatState(chatId);
            Object.assign(chatState, deepObjectCopy(state));
            if (!state.messages) return;
            isLastPage.value = state.messages.length < 20;
        } catch (error) {
            console.error(error);
        } finally {
            isLoadingChat.value = false
        }
    };
    $onWsErrorResolved(() => {
        if (chatState.id)
            setChat(chatState.id);
    });

    const getChatUser = (userId: string) => {
        return chatState.users?.find(user => user.id === userId);
    }

    const lastMessageId = computed(() => chatState.messages?.length ? chatState.messages[0].id : '');

    const loadMoreMessages = async () => {
        if (isLoadingChat.value || isLoadingMoreMessages.value || !chatState.id || isLastPage.value) return;
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

    return {
        isOpened,
        close,
        chatState,
        setChat,
        getChatUser,
        typingUsers,
        loadMoreMessages,
        isLoadingMoreMessages,
        isLoadingChat,
        isLastPage,
        leaveChat
    };
});

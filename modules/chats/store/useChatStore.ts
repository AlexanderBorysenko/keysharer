import type { TChatState } from "../types/TChatState";
import { fetchChatState } from "../service/fetchChatState";
import { fetchChatMessagesPage } from "../service/fetchChatMessagesPage";
import type { ModelTypes } from "~/graphql/zeus";

export const useChatStore = defineStore('chat', () => {
    const {
        onChatDeleted, onChatUpdated, onNewMessage, onTyping, onMessageUpdated
    } = useUserSubscriptionsStore();

    const initialState: TChatState = {
        id: '',
        users: [],
        name: '',
        avatar: '',
        messages: [],
    };

    const isLoadingChat = ref(false);
    const chatState = reactive<TChatState>({ ...initialState });
    const isOpened = ref(false);
    const isLoadingMoreMessages = ref(false);
    const isLastPage = ref(false);

    const resetChatState = () => {
        Object.assign(chatState, initialState);
    };

    const close = () => {
        isOpened.value = false;
        isLoadingChat.value = false;
        resetChatState();
    };

    const updateChatState = (chatUpdated: ModelTypes['Chat']) => {
        if (chatUpdated.id !== chatState.id) return;
        Object.assign(chatState, {
            users: chatUpdated.users || chatState.users,
            name: chatUpdated.name || chatState.name,
            avatar: chatUpdated.avatar || chatState.avatar,
        });
    };

    const handleChatDeleted = (chatDeletedId: string) => {
        if (chatDeletedId !== chatState.id) return;
        close();
    };

    const addNewMessage = (newMessage: any) => {
        if (newMessage.chat_id !== chatState.id) return;
        chatState.messages.push(newMessage);
    };

    const updateTypingStatus = (typing: { chatId: string, userId: string, isTyping: boolean }) => {
        if (typing.chatId !== chatState.id) return;
        const user = chatState.users.find(user => user.id === typing.userId);
        if (user) user.isTyping = typing.isTyping;
    };

    const updateMessage = (messageUpdated: ModelTypes['Message']) => {
        if (messageUpdated.chat_id !== chatState.id) return;
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
            Object.assign(chatState, state);
            isLastPage.value = state.messages.length < 20;
        } catch (error) {
            console.error(error);
        } finally {
            isLoadingChat.value = false
        }
    };
    if (import.meta.client) {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && chatState.id) {
                // reload chat when user returns to the page
                setChat(chatState.id);
            }
        })
    }

    const getChatUser = (userId: string) => {
        return chatState.users.find(user => user.id === userId);
    }

    const lastMessageId = computed(() => chatState.messages.length ? chatState.messages[0].id : '');

    const loadMoreMessages = async () => {
        if (isLoadingChat.value || isLoadingMoreMessages.value || !chatState.id || isLastPage.value) return;
        isLoadingMoreMessages.value = true;
        try {
            const messages = await fetchChatMessagesPage(chatState.id, lastMessageId.value);
            chatState.messages.unshift(...messages);
            isLastPage.value = messages.length < 1;
        } catch (error) {
            console.error(error);
        } finally {
            isLoadingMoreMessages.value = false;
        }
    };

    return {
        isOpened,
        close,
        chatState,
        setChat,
        getChatUser,
        loadMoreMessages,
        isLoadingMoreMessages,
        isLoadingChat,
        isLastPage
    };
});

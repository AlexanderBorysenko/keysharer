import { defineStore } from 'pinia';
import { handleUnauthenticatedError } from '~/graphql/utils/handleUnauthenticatedError';
import type { ModelTypes } from '~/graphql/zeus';
import { useOnlineStatusesStore } from '~/modules/user/store/onlineStatusesStore';
import { useChatStore } from './useChatStore';

export const useChatsListStore = defineStore('chatsMenuStore', () => {
    const { $gqClient, $onWsErrorResolved } =
        useNuxtApp();
    const { pushToQueue } = useQueue();

    const {
        onChatCreated,
        onChatDeleted,
        onChatUpdated,
        onUnreadMessagesCountChange,
    } = useUserSubscriptionsStore();
    const onlineStatusesStore = useOnlineStatusesStore();
    const chats = ref<ModelTypes['Chat'][]>([]);

    const isLoadingChats = ref(false);
    const fetchChats = async () => {
        isLoadingChats.value = true;
        try {
            const response = await $gqClient('query')({
                myChats: {
                    id: true,
                    users: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatar: true,
                        isOnline: true,
                        role: true
                    },
                    avatar: true,
                    updated_at: true,
                    name: true,
                    owner_id: true,
                    unread_messages_count: true
                }
            });
            chats.value = response.myChats;

            chats.value.forEach(chat => {
                chat.users?.forEach(user => {
                    onlineStatusesStore.listenToUser(
                        user.id,
                        user.isOnline || false
                    );
                });
            });
        } catch (e: any) {
            handleUnauthenticatedError(e);
            console.error(e);
        } finally {
            isLoadingChats.value = false;
        }
    };

    fetchChats();
    $onWsErrorResolved(fetchChats);

    const moveChatToTop = (chatUpdated: ModelTypes['Chat']) => {
        const chatIndex = chats.value.findIndex(
            chat => chat.id === chatUpdated.id
        );
        if (chatIndex !== -1) {
            chats.value.splice(chatIndex, 1);
        }
        chats.value.unshift(chatUpdated);
    };

    const onChatCreatedCallback = (chatCreated: ModelTypes['Chat']) => {
        console.log('>>> chat Created', chatCreated);
        pushToQueue(async () => {
            moveChatToTop(chatCreated);
        });
    };

    const onChatDeletedCallback = (chatDeleted: string) => {
        console.log('>>> chat Deleted');
        pushToQueue(async () => {
            chats.value = chats.value.filter(
                chat => chat.id !== chatDeleted
            );
        });
    };

    const onChatUpdatedCallback = (chatUpdated: ModelTypes['Chat']) => {
        console.log('>>> chat Updated', chatUpdated);
        pushToQueue(async () => {
            const chatIndex = chats.value.findIndex(
                chat => chat.id === chatUpdated.id
            );
            if (chatIndex === -1) return;
            chats.value[chatIndex] = chatUpdated;
        });
        chatUpdated.users?.forEach(user => {
            onlineStatusesStore.listenToUser(user.id, user.isOnline || false);
        });
    };

    const onUnreadMessagesCountChangeHandler = (
        payload: ModelTypes['UnreadMessagesCount']
    ) => {
        console.log('>>> unreadMessagesCount Change', payload);
        pushToQueue(async () => {
            const chatIndex = chats.value.findIndex(
                chat => chat.id === payload.chatId
            );
            if (chatIndex !== -1) {
                chats.value[chatIndex].unread_messages_count =
                    payload.unreadCount;
                moveChatToTop(chats.value[chatIndex]);
            }
        });
    };

    onChatCreated(onChatCreatedCallback);
    onChatDeleted(onChatDeletedCallback);
    onChatUpdated(onChatUpdatedCallback);
    onUnreadMessagesCountChange(onUnreadMessagesCountChangeHandler);

    const totalUnreadMessagesCount = computed(() =>
        chats.value.reduce(
            (acc, chat) => acc + (chat.unread_messages_count ?? 0),
            0
        )
    );

    return {
        chats,
        isLoadingChats,
        fetchChats, totalUnreadMessagesCount
    };
});
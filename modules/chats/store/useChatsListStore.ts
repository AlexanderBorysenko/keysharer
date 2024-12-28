import { defineStore } from 'pinia';
import type { ModelTypes } from '~/graphql/zeus';
import { useOnlineStatusesStore } from '~/modules/user/store/onlineStatusesStore';
import {
    getCurrentWindow
} from '@tauri-apps/api/window';

export const useChatsListStore = defineStore('chatsMenuStore', () => {
    const { $executeQuery, $onWsErrorResolved, $notify, $isTauri } =
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
        const {
            data,
        } = await $executeQuery({
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
        chats.value = data;

        chats.value.forEach(chat => {
            chat.users?.forEach(user => {
                onlineStatusesStore.listenToUser(
                    user.id,
                    user.isOnline || false
                );
            });
        });
        isLoadingChats.value = false;
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
        pushToQueue(async () => {
            const chatIndex = chats.value.findIndex(
                chat => chat.id === payload.chatId
            );
            if (chatIndex === -1) return
            const prev = chats.value[chatIndex].unread_messages_count ?? 0;
            chats.value[chatIndex].unread_messages_count =
                payload.unreadCount;
            if (prev < payload.unreadCount) {
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

    let debounceTimeout: ReturnType<typeof setTimeout>;
    const randomUint32 = Math.floor(Math.random() * 0xFFFFFFFF);
    const messagesCounterNotificationId = randomUint32 >= 0x80000000 ? randomUint32 - 0x100000000 : randomUint32;
    watch(totalUnreadMessagesCount, async (unreadMessagesCount, previousUnreadMessagesCount) => {
        if (
            ($isTauri && await getCurrentWindow().isFocused())
            ||
            (!$isTauri && document.visibilityState === 'visible')
        ) return;

        if (unreadMessagesCount <= previousUnreadMessagesCount) return;
        previousUnreadMessagesCount = unreadMessagesCount;

        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        debounceTimeout = setTimeout(() => {
            $notify({
                title: 'Unread messages',
                body: `You have ${unreadMessagesCount} unread messages`,
                id: messagesCounterNotificationId
            });

        }, 2000);
    });

    return {
        chats,
        isLoadingChats,
        fetchChats, totalUnreadMessagesCount
    };
});
import { handleUnauthenticatedError } from "~/graphql/utils/handleUnauthenticatedError";
import { typedGql } from "~/graphql/zeus/typedDocumentNode";

export const useUserSubscriptionsStore = defineStore('userSubscriptionsStore', () => {
    const { $gqClient } = useNuxtApp();

    /**
     * Chat deleted subscription
     */
    const {
        on: onChatDeleted,
        off: offChatDeleted
    } = useSubscription({
        chatDeleted: true
    });

    /**
     * Chat created subscription
     */
    const {
        on: onChatCreated,
        off: offChatCreated
    } = useSubscription({
        chatCreated: {
            id: true,
            users: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                isOnline: true
            },
            usersJoinedAt: {
                joinedAt: true,
                userId: true,
            },
            name: true,
            avatar: true,
            unread_messages_count: true,
            updated_at: true,
            owner_id: true,
        }
    });


    /**
     * Chat updated subscription
     */
    const {
        on: onChatUpdated,
        off: offChatUpdated
    } = useSubscription({
        chatUpdated: {
            id: true,
            users: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                isOnline: true,
            },
            usersJoinedAt: {
                joinedAt: true,
                userId: true,
            },
            name: true,
            avatar: true,
            unread_messages_count: true,
            updated_at: true,
            owner_id: true,
        }
    });

    /**
     * New message subscription
     */
    const {
        on: onNewMessage,
        off: offNewMessage
    } = useSubscription({
        newMessage: {
            id: true,
            chat_id: true,
            user_id: true,
            type: true,
            content: true,
            is_read: true,
            timestamp: true,
            disable_encryption: true,
            files: {
                file_url: true,
                file_name: true,
                file_size: true,
                file_type: true,
            },
        }
    });

    /**
     * messageUpdated subscription
     */
    const {
        on: onMessageUpdated,
        off: offMessageUpdated
    } = useSubscription({
        messageUpdated: {
            id: true,
            chat_id: true,
            user_id: true,
            type: true,
            content: true,
            is_read: true,
            timestamp: true,
            disable_encryption: true,
            files: {
                file_url: true,
                file_name: true,
                file_size: true,
                file_type: true,
            },
        }
    });

    /**
     * Typing subscription
     */
    const sendTypingStatus = async (chatId: string, isTyping: boolean) => {
        try {
            await $gqClient('mutation')({
                updateTypingStatus: [
                    { chatId, isTyping },
                    true
                ]
            });
        } catch (e: any) {
            handleUnauthenticatedError(e);
        }
    }
    const {
        on: onTyping,
        off: offTyping
    } = useSubscription({
        typingStatusUpdated: {
            chatId: true,
            userId: true,
            isTyping: true,
        }
    });

    /**
     * Unread messages count subscription
     */
    const {
        on: onUnreadMessagesCountChange,
        off: offUnreadMessagesCountChange
    } = useSubscription({
        unreadMessagesCountChange: {
            chatId: true,
            unreadCount: true,
        }
    });

    return {
        onChatDeleted,
        offChatDeleted,
        onChatCreated,
        offChatCreated,
        onChatUpdated,
        offChatUpdated,
        onNewMessage,
        offNewMessage,
        onMessageUpdated,
        offMessageUpdated,
        onTyping,
        offTyping,
        sendTypingStatus,
        onUnreadMessagesCountChange,
        offUnreadMessagesCountChange,
    };
});

import { handleUnauthenticatedError } from "~/graphql/utils/handleUnauthenticatedError";
import type { ModelTypes } from "~/graphql/zeus";

export const fetchChatState = async (chatId: string): Promise<ModelTypes['Chat']> => {
    const { $gqClient } = useNuxtApp();
    const {
        addNotification
    } = useAppNotificationsStore();

    try {
        const {
            myChat
        } = await $gqClient('query')({
            myChat: [{
                chatId
            }, {
                id: true, name: true, avatar: true, owner_id: true, iAmAdmin: true, updated_at: true, unread_messages_count: true,
                users:
                {
                    id: true, username: true, displayName: true, avatar: true, isOnline: true,
                },
                messages: [
                    {},
                    {
                        id: true,
                        chat_id: true,
                        user_id: true,
                        type: true,
                        content: true,
                        timestamp: true,
                        is_read: true,
                        reads: true,
                        disable_encryption: true,
                        files: {
                            file_url: true,
                            file_name: true,
                            file_size: true,
                            file_type: true,
                        }
                    }
                ]
            }]
        })
        return myChat;
    } catch (e) {
        addNotification({
            type: 'error',
            message: 'Failed to get chat'
        });
        console.error('Failed to get chat:', e);
        handleUnauthenticatedError(e);
        throw e;
    }
}
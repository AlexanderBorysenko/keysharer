import { getGQErrorMessage } from "~/graphql/utils/getGQErrorMessage";
import type { ModelTypes } from "~/graphql/zeus";

export const fetchChatState = async (chatId: string): Promise<ModelTypes['Chat']> => {
    const { $executeQuery } = useNuxtApp();
    const {
        addNotification
    } = useAppNotificationsStore();

    const { data, errors } = await $executeQuery({
        myChat: [{
            chatId
        }, {
            id: true, name: true, avatar: true, owner_id: true, iAmAdmin: true, updated_at: true, unread_messages_count: true,
            users:
            {
                id: true, username: true, displayName: true, avatar: true, isOnline: true,
            },
            usersJoinedAt: {
                joinedAt: true,
                userId: true,
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
        }],
    })

    if (errors?.length) {
        addNotification({
            type: 'error',
            message: getGQErrorMessage(errors)
        });
    }

    return data;
}
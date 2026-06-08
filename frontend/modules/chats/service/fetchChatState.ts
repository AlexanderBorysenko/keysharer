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
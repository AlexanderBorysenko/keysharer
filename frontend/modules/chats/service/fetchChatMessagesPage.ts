import { handleUnauthenticatedError } from "~/graphql/utils/handleUnauthenticatedError";
import type { ModelTypes } from "~/graphql/zeus";
import { typedGql } from "~/graphql/zeus/typedDocumentNode";

export const fetchChatMessagesPage = async (chatId: string, lastMessageId: string | null): Promise<ModelTypes['Message'][]> => {
    const { $apollo } = useNuxtApp();
    const {
        addNotification
    } = useAppNotificationsStore();

    try {
        const response = await $apollo.value?.query({
            query: typedGql('query')({
                myChat: [{
                    chatId
                }, {
                    messages: [
                        {
                            lastMessageId
                        },
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
                                original_file_name: true,
                                file_size: true,
                                file_type: true,
                            }
                        }
                    ]
                }]
            })
        })

        return response?.data?.myChat.messages || [];
    } catch (e) {
        addNotification({
            type: 'error',
            message: 'Failed to get chat messages'
        });
        handleUnauthenticatedError(e);
        throw e;
    }
}
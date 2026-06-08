import { useChatStore } from "./useChatStore";
import chatEncryptionService from "~/modules/encryption/service/chatEncryptionService";
import { handleUnauthenticatedError } from "~/graphql/utils/handleUnauthenticatedError";
import { getGQErrorMessage } from "~/graphql/utils/getGQErrorMessage";
import type { ModelTypes } from "~/graphql/zeus";
import { useEncryptionKeysStore } from "~/modules/encryption/store/useEncryptionKeysStore";
import { typedGql } from "~/graphql/zeus/typedDocumentNode";

export const useMessageFormStore = defineStore('messageFormStore', () => {
    const appNotificationsStore = useAppNotificationsStore();
    const chatStore = useChatStore();
    const encryptionKeys = useEncryptionKeysStore();
    const isSendingMessage = ref(false);
    const { $apollo } = useNuxtApp();

    const messageForms: Ref<{
        [key: string]: {
            content: string;
            encryptedContent: string;
            files: File[];
        }
    }> = ref({});

    const content = computed({
        get: () => messageForms.value[chatStore.chatState.id || '']?.content || '',
        set: (value) => {
            if (!chatStore.chatState.id) return;
            messageForms.value[chatStore.chatState.id].content = value;
        }
    })
    const encryptedContent = computed(() => {
        if (!content.value) return '';
        return chatEncryptionService.encryptTextMessage(content.value.trim());
    })
    const files = computed({
        get: () => messageForms.value[chatStore.chatState.id || '']?.files || [],
        set: (value) => {
            if (!chatStore.chatState.id) return;
            messageForms.value[chatStore.chatState.id].files = value;
        }
    })
    const addFile = (file: File) => {
        files.value.push(file);
    }
    const removeFile = (file: File) => {
        files.value = files.value.filter((f) => f !== file);
    }

    watch(() => chatStore.chatState.id, (chatId) => {
        if (!chatId) return;
        if (messageForms.value[chatId]) return;
        messageForms.value[chatId] = {
            content: '',
            encryptedContent: '',
            files: [],
        };
    }, { immediate: true });

    const submitMessageForm = async () => {
        const chatId = chatStore.chatState.id;
        if (!chatId || isSendingMessage.value) return;
        isSendingMessage.value = true;

        if (!content.value.trim().length && !files.value.length) {
            isSendingMessage.value = false;
            return;
        }

        const messageContent = encryptionKeys.isEncryptionEnabled ?
            encryptedContent.value :
            content.value.trim();

        const encryptedFiles: ModelTypes['UploadedEncryptedFileInput'][] = [];
        for (const file of files.value) {
            let content = '';
            if (encryptionKeys.isEncryptionEnabled) {
                content = await chatEncryptionService.encryptFile(file);
            }
            else {
                const reader = new FileReader();
                content = await new Promise<string>((resolve) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                });
            }
            encryptedFiles.push({
                content: content,
                filename: file.name,
                mimeType: file.type,
                isEncrypted: encryptionKeys.isEncryptionEnabled,
            });
        }

        try {
            if (!$apollo.value) throw new Error('Apollo client is not initialized');
            await $apollo.value.mutate({
                mutation: typedGql('mutation')({
                    sendMessage: [
                        {
                            input: {
                                chatId,
                                disableEncryption: !encryptionKeys.isEncryptionEnabled,
                                content: messageContent,
                                files: encryptedFiles,
                            }
                        },
                        true
                    ]
                })
            });

            messageForms.value[chatId].content = '';
            messageForms.value[chatId].files = [];
        } catch (error: any) {
            handleUnauthenticatedError(error);
            appNotificationsStore.addNotification({
                type: 'error',
                message: getGQErrorMessage(error)
            });
        } finally {
            isSendingMessage.value = false;
        }
    }

    const fileDropEventHandler = (event: DragEvent) => {
        event.preventDefault();
        const droppedFiles = Array.from(event.dataTransfer?.files || []);
        droppedFiles.forEach((file) => {
            files.value.push(file);
        });
    }
    const filePasteEventHandler = (event: ClipboardEvent) => {
        const pastedFiles = Array.from(event.clipboardData?.files || []);
        pastedFiles.forEach((file) => {
            files.value.push(file);
        });
    }

    return {
        isSendingMessage,
        content,
        files,
        addFile,
        removeFile,
        encryptedContent,
        submitMessageForm,
        fileDropEventHandler,
        filePasteEventHandler,
    }
})
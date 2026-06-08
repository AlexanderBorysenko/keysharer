import { useChatStore } from "~/modules/chats/store/useChatStore";
import { useEncryptionKeysStore } from "./useEncryptionKeysStore";
import { getGQErrorMessage } from "~/graphql/utils/getGQErrorMessage";
import chatEncryption from "../service/chatEncryptionService";
import { typedGql } from "~/graphql/zeus/typedDocumentNode";
import { $ } from "~/graphql/zeus";

type TransactionStatus = 'pending' | 'accepted' | 'rejected' | 'networkError' | 'success';

export type OutgoingKeySharingTransaction = {
    id: string;
    receiverId: string;
    chatId: string;
    receiverPublicKey: string;
    status: TransactionStatus;
    compleat: boolean;
}
export type IncomingKeySharingTransaction = {
    id: string;
    senderId: string;
    chatId: string;
    publicKey: string;
    privateKey: CryptoKey;
    receivedKey: string;
    status: TransactionStatus;
}

export const useKeySharingStore = defineStore('keySharingStore', () => {
    const {
        $apollo,
        $useSubscription: useSubscription,
    } = useNuxtApp();
    const {
        chatState
    } = useChatStore();
    const {
        getKey
    } = useEncryptionKeysStore();
    const appNotificationsStore = useAppNotificationsStore();

    const isKeySharingModalOpened = ref(false);
    const openKeySharingModal = () => {
        isKeySharingModalOpened.value = true;
    }
    const closeKeySharingModal = () => {
        isKeySharingModalOpened.value = false;
    }

    const outgoingTransactions = ref<OutgoingKeySharingTransaction[]>([]);
    const getCurrentChatOutgoingTransactions = (chatId: string) => {
        return outgoingTransactions.value.filter(t => t.chatId === chatId);
    }
    const currentChatOutgoingTransactions = computed<OutgoingKeySharingTransaction[]>(() => getCurrentChatOutgoingTransactions(chatState.id ?? ''));
    const getOutgoingTransactionIndex = (transactionId: string) => {
        return outgoingTransactions.value.findIndex(t => t.id === transactionId);
    }
    const deleteOutgoingTransaction = (transactionId: string) => {
        const index = getOutgoingTransactionIndex(transactionId);
        if (index === -1) return;
        outgoingTransactions.value.splice(index, 1);
    }

    const incomingTransactions = ref<IncomingKeySharingTransaction[]>([]);
    const getChatIncomingTransactions = (chatId: string) => {
        return incomingTransactions.value.filter(t => t.chatId === chatId);
    }
    const currentChatIncomingTransactions = computed<IncomingKeySharingTransaction[]>(() => getChatIncomingTransactions(chatState.id ?? ''));
    const getIncomingTransactionIndex = (transactionId: string) => {
        return incomingTransactions.value.findIndex(t => t.id === transactionId);
    }
    const deleteIncomingTransaction = (transactionId: string) => {
        const index = getIncomingTransactionIndex(transactionId);
        if (index === -1) return;
        incomingTransactions.value.splice(index, 1);
    }

    const sendKey = async ({
        chatId,
        receiverId
    }: {
        chatId: string;
        receiverId: string;
    }) => {
        try {
            if (!$apollo.value) throw new Error('Apollo client is not initialized');
            const response = await $apollo.value.mutate({
                mutation: typedGql('mutation')({
                    sendKeySharingTransaction: [{
                        input: {
                            chatId,
                            userId: receiverId,
                        }
                    }, true]
                })
            });
            const transactionId = response.data?.sendKeySharingTransaction;
            if (!transactionId) throw new Error('Failed to send key sharing transaction');

            outgoingTransactions.value.push({
                id: transactionId,
                receiverId,
                chatId,
                receiverPublicKey: '',
                status: 'pending',
                compleat: false
            });

            const { on: onReceivedKeySharingTransactionPublicKey, stopSubscription: stopOnRKSTPK } = useSubscription({
                onReceivedKeySharingTransactionPublicKey: [
                    { transactionId }, true
                ]
            });
            onReceivedKeySharingTransactionPublicKey(async (payloadPublicKey) => {
                const index = getOutgoingTransactionIndex(transactionId);
                if (index === -1) return;
                if (outgoingTransactions.value[index].status !== 'pending') return;
                outgoingTransactions.value[index].receiverPublicKey = payloadPublicKey;
                outgoingTransactions.value[index].status = 'accepted';
                const chatKey = getKey(chatId);
                const publicKey = await chatEncryption.importPublicKey(payloadPublicKey);
                if (!chatKey) return;
                const encryptedKey = await chatEncryption.encryptWithPublicKey(publicKey, chatKey);
                try {
                    if (!$apollo.value) throw new Error('Apollo client is not initialized');
                    await $apollo.value.mutate({
                        mutation: typedGql('mutation')({
                            sendKeySharingTransactionEncryptedKey: [{
                                input: {
                                    transactionId,
                                    encryptedKey
                                }
                            }, true]
                        })
                    })
                } catch (e: any) {
                    appNotificationsStore.addNotification({
                        type: 'error',
                        message: getGQErrorMessage(e.response),
                    });
                    return;
                }
                stopOnRKSTPK();
            });
            const {
                on: onKeySharingTransactionSuccess,
                stopSubscription: stopOnKSTS
            } = useSubscription({
                onKeySharingTransactionSuccess: [{
                    transactionId
                }, true]
            })
            onKeySharingTransactionSuccess(() => {
                const index = getOutgoingTransactionIndex(transactionId);
                if (index === -1) return;
                if (outgoingTransactions.value[index].status !== 'accepted') return;
                outgoingTransactions.value[index].status = 'success';
                outgoingTransactions.value[index].compleat = true;
                stopOnKSTS();
            });

            setTimeout(async () => {
                const index = getOutgoingTransactionIndex(transactionId);
                if (index === -1) return;
                if (outgoingTransactions.value[index].status === 'success') return;
                outgoingTransactions.value[index].status = 'networkError';
                outgoingTransactions.value[index].compleat = true;

                stopOnRKSTPK();
                stopOnKSTS();

                appNotificationsStore.addNotification({
                    type: 'error',
                    message: 'Failed to send key sharing transaction'
                });
            }, 10000);
        } catch (e: any) {
            appNotificationsStore.addNotification({
                type: 'error',
                message: getGQErrorMessage(e.response),
            });
            return;
        }
    }

    const {
        on: onIncomingKeySharingTransaction
    } = useSubscription({
        'onIncomingKeySharingTransaction': {
            chatId: true, senderId: true, transactionId: true
        }
    });
    onIncomingKeySharingTransaction(async ({
        chatId, senderId, transactionId
    }) => {
        const keyPair = await chatEncryption.generateKeyPair();
        const publicKey = await chatEncryption.exportPublicKey(keyPair.publicKey);
        try {
            $apollo.value?.mutate({
                mutation:
                    typedGql('mutation')({
                        sendKeySharingTransactionPublicKey: [{
                            input: {
                                transactionId,
                                publicKey
                            }
                        }, true]
                    })
            });
            const { on:
                onReceivedKeySharingTransactionEncryptedKey,
                stopSubscription: stopOnRKSTEK
            } = useSubscription({
                onReceivedKeySharingTransactionEncryptedKey: [{
                    transactionId
                }, true]
            });
            onReceivedKeySharingTransactionEncryptedKey(async (encryptedKey) => {
                const receivedKey = await chatEncryption.decryptWithPrivateKey(keyPair.privateKey, encryptedKey);

                incomingTransactions.value.push({
                    id: transactionId,
                    senderId,
                    chatId,
                    publicKey,
                    privateKey: keyPair.privateKey,
                    receivedKey,
                    status: 'success',
                });
                await $apollo.value?.mutate({
                    mutation: typedGql('mutation')({
                        sendKeySharingTransactionSuccess: [{
                            input: {
                                transactionId,
                                success: true
                            }
                        }, true]
                    })
                });
                stopOnRKSTEK();
            });

            setTimeout(async () => {
                const index = getIncomingTransactionIndex(transactionId);
                if (index === -1) return;
                if (incomingTransactions.value[index].status === 'success') return;
                stopOnRKSTEK();
                deleteIncomingTransaction(transactionId);
            }, 10000);
        } catch (e: any) { }
    })

    return {
        isKeySharingModalOpened,
        openKeySharingModal,
        closeKeySharingModal,
        currentChatOutgoingTransactions,
        deleteOutgoingTransaction,
        getChatIncomingTransactions,
        currentChatIncomingTransactions,
        deleteIncomingTransaction,
        sendKey
    }
})
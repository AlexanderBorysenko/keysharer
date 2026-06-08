import { mergeTypeDefs } from "@graphql-tools/merge";
import { sendKeySharingTransaction, sendKeySharingTransactionDefs } from "./resolvers/keySharing.sendKeySharingTransaction.mutation";
import { onIncomingKeySharingTransactionSubscription, onIncomingKeySharingTransactionSubscriptionDefs } from "./resolvers/keySharing.onIncomingKeySharingTransaction.subscription";
import { sendKeySharingTransactionPublicKey, sendKeySharingTransactionPublicKeyDefs } from "./resolvers/keySharing.sendKeySharingTransactionPublicKey.mutation";
import { onReceivedKeySharingTransactionPublicKeySubscription, onReceivedKeySharingTransactionPublicKeySubscriptionDefs } from "./resolvers/keySharing.onReceivedKeySharingTransactionPublicKey.subscription";
import { onReceivedKeySharingTransactionEncryptedKeySubscription, onReceivedKeySharingTransactionEncryptedKeySubscriptionDefs } from "./resolvers/keySharing.onReceivedKeySharingTransactionEncryptedKey.subscription";
import { sendKeySharingTransactionEncryptedKey, sendKeySharingTransactionEncryptedKeyDefs } from "./resolvers/keySharing.sendKeySharingTransactionEncryptedKey.mutation";
import { onKeySharingTransactionSuccessSubscription, onKeySharingTransactionSuccessSubscriptionDefs } from "./resolvers/keySharing.onKeySharingTransactionSuccess.subscription";
import { sendKeySharingTransactionSuccess, sendKeySharingTransactionSuccessDefs } from "./resolvers/keySharing.sendKeySharingTransactionSuccess.mutation";

export const keySharingResolvers = {
    Query: {
    },
    Mutation: {
        sendKeySharingTransaction,
        sendKeySharingTransactionPublicKey,
        sendKeySharingTransactionEncryptedKey,
        sendKeySharingTransactionSuccess
    },
    Subscription: {
        onIncomingKeySharingTransaction: onIncomingKeySharingTransactionSubscription,
        onReceivedKeySharingTransactionPublicKey: onReceivedKeySharingTransactionPublicKeySubscription,
        onReceivedKeySharingTransactionEncryptedKey: onReceivedKeySharingTransactionEncryptedKeySubscription,
        onKeySharingTransactionSuccess: onKeySharingTransactionSuccessSubscription
    },
};

export const keySharingDefs = mergeTypeDefs([
    sendKeySharingTransactionDefs,
    onIncomingKeySharingTransactionSubscriptionDefs,
    sendKeySharingTransactionPublicKeyDefs,
    onReceivedKeySharingTransactionPublicKeySubscriptionDefs,
    sendKeySharingTransactionEncryptedKeyDefs,
    onReceivedKeySharingTransactionEncryptedKeySubscriptionDefs,
    sendKeySharingTransactionSuccessDefs,
    onKeySharingTransactionSuccessSubscriptionDefs
]);

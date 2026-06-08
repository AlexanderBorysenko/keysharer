import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { pubsub } from "../../../graphql/pubSub";
import { types } from "cassandra-driver";

export const onReceivedKeySharingTransactionEncryptedKeySubscriptionDefs = `
type Subscription {
    onReceivedKeySharingTransactionEncryptedKey(transactionId: ID!): String!
}
`;

export const onReceivedKeySharingTransactionEncryptedKeySubscription = {
    subscribe: async (_: unknown, { transactionId }: { transactionId: string }, context: AppQraphQLContext) => {
        return pubsub.subscribe(`KEY_SHARING_TRANSACTION_ENCRYPTED_KEY_${transactionId}`);
    },
    resolve: (payload: { encryptedKey: string }) => {
        return payload.encryptedKey;
    }
};

export const publishKeySharingTransactionEncryptedKey = async ({
    transactionId,
    encryptedKey,
}: {
    transactionId: string;
    encryptedKey: string;
}) => {
    pubsub.publish(`KEY_SHARING_TRANSACTION_ENCRYPTED_KEY_${transactionId}`, {
        encryptedKey
    });
};
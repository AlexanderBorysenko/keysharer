import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { pubsub } from "../../../graphql/pubSub";

export const onKeySharingTransactionSuccessSubscriptionDefs = `
type Subscription {
    onKeySharingTransactionSuccess(transactionId: ID!): Boolean!
}`;

export const onKeySharingTransactionSuccessSubscription = {
    subscribe: async (_: unknown, { transactionId }: { transactionId: string }, context: AppQraphQLContext) => {
        return pubsub.subscribe(`KEY_SHARING_TRANSACTION_SUCCESS_${transactionId}`);
    },
    resolve: (payload: boolean) => {
        return payload;
    }
};

export const publishKeySharingTransactionSuccess = async ({
    transactionId,
    success,
}: {
    transactionId: string;
    success: boolean;
}) => {
    pubsub.publish(`KEY_SHARING_TRANSACTION_SUCCESS_${transactionId}`, success);
};
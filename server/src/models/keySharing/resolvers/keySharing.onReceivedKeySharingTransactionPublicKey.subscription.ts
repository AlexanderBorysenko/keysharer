import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { pubsub } from "../../../graphql/pubSub";
import { types } from "cassandra-driver";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";

export const onReceivedKeySharingTransactionPublicKeySubscriptionDefs = `
type Subscription {
    onReceivedKeySharingTransactionPublicKey(transactionId: ID!): String!
}
`;

export const onReceivedKeySharingTransactionPublicKeySubscription = {
    subscribe: async (_: unknown, {
        transactionId
    }: { transactionId: string }, context: AppQraphQLContext) => {
        await isAuthenticatedMiddleware(context);
        return pubsub.subscribe(`KEY_SHARING_TRANSACTION_PUBLIC_KEY_${transactionId}`);
    },
    resolve: (payload: { publicKey: string }) => {
        return payload;
    }
};

export const publishKeySharingTransactionPublicKey = async ({
    transactionId,
    publicKey,
}: {
    transactionId: types.Uuid;
    publicKey: string;
}) => {
    pubsub.publish(`KEY_SHARING_TRANSACTION_PUBLIC_KEY_${transactionId.toString()}`,
        publicKey
    );
};
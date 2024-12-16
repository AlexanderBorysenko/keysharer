import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { pubsub } from "../../../graphql/pubSub";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import { types } from "cassandra-driver";

export const onIncomingKeySharingTransactionSubscriptionDefs = `
type Subscription {
    onIncomingKeySharingTransaction: IncomingKeySharingTransaction!
}

type IncomingKeySharingTransaction {
    chatId: ID!
    senderId: ID!
    transactionId: ID!
}
`;

export const onIncomingKeySharingTransactionSubscription = {
    subscribe: async (_: unknown, __: unknown, context: AppQraphQLContext) => {
        const user = await isAuthenticatedMiddleware(context);
        return pubsub.subscribe(`ON_INCOMING_KEY_SHARING_TRANSACTION_${user.id.toString()}`);
    },
    resolve: (payload: { chatId: string; senderId: string; transactionId: string }) => {
        return payload;
    }
};

export const publishIncomingKeySharingTransaction = async ({
    chatId,
    senderId,
    transactionId,
    userId
}: {
    chatId: types.Uuid;
    senderId: types.Uuid;
    transactionId: types.Uuid;
    userId: types.Uuid;
}) => {
    pubsub.publish(`ON_INCOMING_KEY_SHARING_TRANSACTION_${userId.toString()}`, {
        chatId: chatId.toString(),
        senderId: senderId.toString(),
        transactionId: transactionId.toString()
    });
};
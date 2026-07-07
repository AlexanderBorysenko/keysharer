import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { types } from "cassandra-driver";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import { publishKeySharingTransactionPublicKey } from "./keySharing.onReceivedKeySharingTransactionPublicKey.subscription";

export type SendKeySharingTransactionPublicKeyInput = {
    transactionId: types.Uuid;
    publicKey: string;
};

export const sendKeySharingTransactionPublicKeyDefs = `
input SendKeySharingTransactionPublicKeyInput {
    transactionId: ID!
    publicKey: String!
}

type Mutation {
    sendKeySharingTransactionPublicKey(input: SendKeySharingTransactionPublicKeyInput!): Boolean!
}
`;

export const sendKeySharingTransactionPublicKey = async (
    _: any,
    { input: { transactionId, publicKey } }: { input: SendKeySharingTransactionPublicKeyInput },
    context: AppQraphQLContext
): Promise<boolean> => {
    await isAuthenticatedMiddleware(context);
    await publishKeySharingTransactionPublicKey({
        transactionId,
        publicKey,
    });

    return true;
};
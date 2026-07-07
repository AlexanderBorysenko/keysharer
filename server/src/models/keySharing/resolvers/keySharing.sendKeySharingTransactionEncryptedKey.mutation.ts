import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import { publishKeySharingTransactionEncryptedKey } from "./keySharing.onReceivedKeySharingTransactionEncryptedKey.subscription";

export const sendKeySharingTransactionEncryptedKeyDefs = `
input SendKeySharingTransactionEncryptedKeyInput {
    transactionId: ID!
    encryptedKey: String!
}

type Mutation {
    sendKeySharingTransactionEncryptedKey(input: SendKeySharingTransactionEncryptedKeyInput!): Boolean!
}
`;

export type SendKeySharingTransactionEncryptedKeyInput = {
    transactionId: string;
    encryptedKey: string;
};

export const sendKeySharingTransactionEncryptedKey = async (
    _: any,
    { input: { transactionId, encryptedKey } }: { input: SendKeySharingTransactionEncryptedKeyInput },
    context: AppQraphQLContext
): Promise<boolean> => {
    await isAuthenticatedMiddleware(context);
    await publishKeySharingTransactionEncryptedKey({
        transactionId,
        encryptedKey,
    });

    return true;
};
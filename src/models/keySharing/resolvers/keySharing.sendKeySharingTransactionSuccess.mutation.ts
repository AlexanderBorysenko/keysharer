import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { publishKeySharingTransactionSuccess } from "./keySharing.onKeySharingTransactionSuccess.subscription";

export type SendKeySharingTransactionSuccessInput = {
    transactionId: string;
    success: boolean;
};

export const sendKeySharingTransactionSuccessDefs = `
input SendKeySharingTransactionSuccessInput {
    transactionId: ID!
    success: Boolean!
}

type Mutation {
    sendKeySharingTransactionSuccess(input: SendKeySharingTransactionSuccessInput!): Boolean!
}
`;

export const sendKeySharingTransactionSuccess = async (
    _: any,
    { input: { transactionId, success } }: { input: SendKeySharingTransactionSuccessInput },
    context: AppQraphQLContext
): Promise<boolean> => {
    console.log('sendKeySharingTransactionSuccess', transactionId, success);
    await publishKeySharingTransactionSuccess({
        transactionId,
        success,
    });

    return true;
};
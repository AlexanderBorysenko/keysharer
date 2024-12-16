import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { types } from "cassandra-driver";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import { isUserAChatMemberMiddleware } from "../../chat/service/isUserAChatMemeber";
import userActiveSessionsService from "../../user/service/userActiveSessionsService";
import { GraphQLError } from "graphql";
import { publishIncomingKeySharingTransaction } from "./keySharing.onIncomingKeySharingTransaction.subscription";

export type SendKeySharingTransactionInput = {
    chatId: types.Uuid;
    userId: types.Uuid;
};

export const sendKeySharingTransactionDefs = `
input SendKeySharingTransactionInput {
    chatId: ID!
    userId: ID!
}

type Mutation {
    sendKeySharingTransaction(input: SendKeySharingTransactionInput!): ID!
}
`;

export const sendKeySharingTransaction = async (
    _: any,
    { input: { chatId, userId } }: { input: SendKeySharingTransactionInput },
    context: AppQraphQLContext
): Promise<types.TimeUuid> => {
    const user = await isAuthenticatedMiddleware(context);
    isUserAChatMemberMiddleware({
        chatId,
        userId: user.id,
    });
    if (!(await userActiveSessionsService.isUserOnline(userId))) {
        throw new GraphQLError("Selected user is not online, please try again later");
    }
    const id = types.TimeUuid.now();
    await publishIncomingKeySharingTransaction({
        chatId,
        senderId: user.id,
        transactionId: id,
        userId,
    });

    return id;
};
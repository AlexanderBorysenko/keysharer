import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../middleware/isAuthenticatedMiddleware";
import { usersOnlinePingPongIterationIdsStorage } from "../storage/usersOnlinePingPongStorage";

export const onlineServerPongDefs = `
input OnlineServerPongInput {
    pingPongId: ID!
    pingPongIterationId: ID!
}

type Mutation {
    onlineServerPong(input: OnlineServerPongInput!): Boolean!
}
`;

export const onlineServerPong = async (
    _: any,
    { input: { pingPongId, pingPongIterationId } }: { input: { pingPongId: string, pingPongIterationId: string } },
    context: AppQraphQLContext
): Promise<boolean> => {
    await isAuthenticatedMiddleware(context);

    usersOnlinePingPongIterationIdsStorage.set(pingPongId, pingPongIterationId);
    return true;
};
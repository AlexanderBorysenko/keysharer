import { types } from "cassandra-driver";
import type { AppQraphQLContext } from "../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../models/user/middleware/isAuthenticatedMiddleware";
import { pubsub } from "./pubSub";
import { mergeTypeDefs } from "@graphql-tools/merge";

const wsConnectionInitialSubscriptionDefs = `
type Subscription {
    wsConnectionInitial: Boolean!
}`;

const wsConnectionInitialSubscription = {
    subscribe: async (_: unknown, __: unknown, context: AppQraphQLContext) => {
        const user = await isAuthenticatedMiddleware(context);
        const id = types.Uuid.random();
        return pubsub.subscribe(`INITIAL_CONNECTCION_${user.id.toString()}_${id.toString()}`);
    },
    resolve: (payload: boolean) => {
        return payload;
    }
};
export const wsConnectionInitialResolver = {
    Subscription: {
        wsConnectionInitial: wsConnectionInitialSubscription
    }
};

export const wsConnectionInitialResolverDefs = mergeTypeDefs([
    wsConnectionInitialSubscriptionDefs
]);
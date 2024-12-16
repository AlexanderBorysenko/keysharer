import { chatDefs } from "../models/chat/chat.graphql";
import { keySharingDefs } from "../models/keySharing/keySharing.graphql";
import { messageDefs } from "../models/message/message.graphql";
import { userDefs } from "../models/user/user.graphql";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { wsConnectionInitialResolverDefs } from "./wsConnectionInitialSubscription";

export const typeDefs = mergeTypeDefs([
    wsConnectionInitialResolverDefs,
    userDefs,
    chatDefs,
    messageDefs,
    keySharingDefs
]);

import { mergeResolvers } from "@graphql-tools/merge";
import { userResolvers } from "../models/user/user.graphql";
import { chatResolvers } from "../models/chat/chat.graphql";
import { messageResolvers } from "../models/message/message.graphql";
import { keySharingResolvers } from "../models/keySharing/keySharing.graphql";

export const resolvers = mergeResolvers([
    userResolvers,
    chatResolvers,
    messageResolvers,
    keySharingResolvers
]);

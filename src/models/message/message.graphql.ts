import { mergeTypeDefs } from "@graphql-tools/merge";
import { newMessageSubscription, newMessageSubscriptionDefs } from "./resolvers/message.newMessage.subscription";
import { sendMessageDefs, sendMessageMutation } from "./resolvers/message.sendMessage.mutation";
import { messageCoreDefs } from "./message.types";

export const messageResolvers = {
  Mutation: {
    sendMessage: sendMessageMutation
  },
  Subscription: {
    newMessage: newMessageSubscription
  }
};

export const messageDefs = mergeTypeDefs([
  messageCoreDefs, sendMessageDefs, newMessageSubscriptionDefs
]);

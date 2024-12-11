import { mergeTypeDefs } from "@graphql-tools/merge";
import { newMessageSubscription, newMessageSubscriptionDefs } from "./resolvers/message.newMessage.subscription";
import { sendMessageDefs, sendMessageMutation } from "./resolvers/message.sendMessage.mutation";
import { messageCoreDefs, type TMessage } from "./message.types";
import { messageContent } from "./resolvers/message.Message.content";

export const messageResolvers = {
  Mutation: {
    sendMessage: sendMessageMutation
  },
  Subscription: {
    newMessage: newMessageSubscription
  },
  Message: {
    content: messageContent
  }
};

export const messageDefs = mergeTypeDefs([
  messageCoreDefs, sendMessageDefs, newMessageSubscriptionDefs
]);

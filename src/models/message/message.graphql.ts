import { mergeTypeDefs } from "@graphql-tools/merge";
import { newMessageSubscription, newMessageSubscriptionDefs } from "./resolvers/message.newMessage.subscription";
import { sendMessageDefs, sendMessageMutation } from "./resolvers/message.sendMessage.mutation";
import { messageCoreDefs, type TMessage } from "./message.types";
import { messageContent } from "./resolvers/message.Message.content";
import { readMessageDefs, readMessageMutation } from "./resolvers/message.readMessage.mutation";
import { unreadMessagesCountChangeDefs, unreadMessagesCountChangeSubscription } from "./resolvers/message.unreadMessagesCountChage.subscription";

export const messageResolvers = {
  Mutation: {
    sendMessage: sendMessageMutation,
    readMessage: readMessageMutation
  },
  Subscription: {
    newMessage: newMessageSubscription,
    unreadMessagesCountChange: unreadMessagesCountChangeSubscription
  },
  Message: {
    content: messageContent
  }
};

export const messageDefs = mergeTypeDefs([
  messageCoreDefs,

  sendMessageDefs,
  readMessageDefs,

  newMessageSubscriptionDefs,
  unreadMessagesCountChangeDefs
]);

import { mergeTypeDefs } from "@graphql-tools/merge";
import { newMessageSubscription, newMessageSubscriptionDefs } from "./resolvers/message.newMessage.subscription";
import { sendMessageDefs, sendMessageMutation } from "./resolvers/message.sendMessage.mutation";
import { messageCoreDefs, type TMessage } from "./message.types";
import { messageContent } from "./resolvers/message.Message.content";
import { readMessageDefs, readMessageMutation } from "./resolvers/message.readMessage.mutation";
import { unreadMessagesCountChangeDefs, unreadMessagesCountChangeSubscription } from "./resolvers/message.unreadMessagesCountChage.subscription";
import { messageUpdatedSubscription, messageUpdatedSubscriptionDefs } from "./resolvers/message.messageUpdated.subscription";

export const messageResolvers = {
  Mutation: {
    sendMessage: sendMessageMutation,
    readMessage: readMessageMutation
  },
  Message: {
    content: messageContent,
  },
  Subscription: {
    newMessage: newMessageSubscription,
    unreadMessagesCountChange: unreadMessagesCountChangeSubscription,
    messageUpdated: messageUpdatedSubscription
  }
};

export const messageDefs = mergeTypeDefs([
  messageCoreDefs,

  sendMessageDefs,
  readMessageDefs,

  newMessageSubscriptionDefs,
  messageUpdatedSubscriptionDefs,
  unreadMessagesCountChangeDefs
]);

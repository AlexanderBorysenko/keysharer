import { messageTypeDef } from "./message.types";
import { newMessageSubscription, newMessageSubscriptionDef } from "./resolvers/message.newMessage.subscription";
import { sendMessageMutation, sendMessageMutationDef } from "./resolvers/message.sendMessage.mutation";

export const messageDefs = `
  ${messageTypeDef}

  type Mutation {
    ${sendMessageMutationDef}
  }
  type Subscription {
    ${newMessageSubscriptionDef}
  }
`;

export const messageResolvers = {
  Mutation: {
    sendMessage: sendMessageMutation
  },
  Subscription: {
    newMessage: newMessageSubscription
  }
};
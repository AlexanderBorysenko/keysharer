
import { chatCardTypeDef, chatTypeDef } from "./chat.types";
import { createUserChatInputTypeDef, createUserChatMutation, createUserChatMutationDef } from "./resolvers/chat.createUserChat.mutation";
import { myChatCardsQuery, myChatCardsQueryDef } from "./resolvers/chat.myChatCards.query";
import { myChatCardsSubscription, myChatCardsSubscriptionDef } from "./resolvers/chat.myChatCardsUpdate.subscription";
import { chatUsersQuery } from "./resolvers/chat.Chat.users.query";
import { chatNameQuery } from "./resolvers/chat.Chat.name.query";
import { deleteUserChatMutaion, deleteUserChatMutationDef } from "./resolvers/chat.deleteUserChat.mutation";
import { chatMessagesQuery } from "./resolvers/chat.Chat.messages.query";
import { myChatsQuery, myChatsQueryDef } from "./resolvers/chat.myChats.query";

export const chatResolvers = {
  Query: {
    myChatCards: myChatCardsQuery,
    myChats: myChatsQuery
  },
  Mutation: {
    createUserChat: createUserChatMutation,
    deleteUserChat: deleteUserChatMutaion
  },
  Subscription: {
    myChatCards: myChatCardsSubscription
  },
  Chat: {
    users: chatUsersQuery,
    name: chatNameQuery,
    messages: chatMessagesQuery
  }
};

export const chatDefs = `
  ${chatTypeDef}
  ${chatCardTypeDef}

  type Query {
    ${myChatCardsQueryDef}
    ${myChatsQueryDef}
  }

  ${createUserChatInputTypeDef}
  type Mutation {
    ${createUserChatMutationDef},
    ${deleteUserChatMutationDef}
  }

  type Subscription {
    ${myChatCardsSubscriptionDef}
  }
`;
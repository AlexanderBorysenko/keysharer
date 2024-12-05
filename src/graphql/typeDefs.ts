import { chatDefs } from "../models/chat/chat.graphql";
import { messageDefs } from "../models/message/message.graphql";
import { userDefs } from "../models/user/user.graphql";
import { mergeTypeDefs } from "@graphql-tools/merge";

export const typeDefs = mergeTypeDefs([userDefs, chatDefs, messageDefs]);

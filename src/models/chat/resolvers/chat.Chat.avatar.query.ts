import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import type { Chat } from "../chat.types";
import { getChatAvatar } from "../service/getChatAvatar";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";

export const chatAvatar = async (chat: Chat, _: any, context: AppQraphQLContext) => {
    const user = await isAuthenticatedMiddleware(context);
    return getChatAvatar(chat.id, user.id);
};
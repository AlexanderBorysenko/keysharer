import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import type { Chat } from "../chat.types";
import { getChatName } from "../service/getChatName";

export const chatName = async (parent: Chat, args: any, context: AppQraphQLContext) => {
    const user = await isAuthenticatedMiddleware(context);

    return getChatName(parent.id, user.id);
}
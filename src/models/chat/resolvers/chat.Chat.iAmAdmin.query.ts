import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import type { Chat } from "../chat.types";
import { isUserAChatAdministrator, isUserAChatAdministratorMiddleware } from "../service/isUserAChatAdministrator";

export const chatIAmAdmin = async (chat: Chat, _: any, context: AppQraphQLContext): Promise<boolean> => {
    const user = await isAuthenticatedMiddleware(context);
    return await isUserAChatAdministrator(
        {
            userId: user.id,
            chatReferense: chat,
        }
    );
};
import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import type { TMessage, TMessageFile } from "../message.types";
import messageDBService from "../service/messageDBService";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";

export const messageFilesResolver = async (
    message: TMessage,
    _: unknown,
    context: AppQraphQLContext
): Promise<TMessageFile[]> => {
    await isAuthenticatedMiddleware(context);
    return await messageDBService.getMessageFiles({ messageId: message.id });
};
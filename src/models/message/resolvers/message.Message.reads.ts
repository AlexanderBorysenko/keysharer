import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import type { TMessage } from "../message.types";
import type { User } from "../../user/user.types";
import { rowToObject } from "../../../utils/rowToObject";
import messageDBService from "../service/messageDBService";
import type { types } from "cassandra-driver";
import { isAuthenticatedMiddleware } from "../../user/middleware/isAuthenticatedMiddleware";
import { getChatUserIds } from "../../chat/service/getChatUserIds";

export const getMessageReads = async (
    message: TMessage,
    _: unknown,
    context: AppQraphQLContext
): Promise<types.Uuid[]> => {
    const user = await isAuthenticatedMiddleware(context);
    const chatUserIds = await getChatUserIds({
        chatId: message.chat_id,
        exclude: [user.id]
    });
    return await messageDBService.getMessageReads({ message, targetUserIds: chatUserIds });
}
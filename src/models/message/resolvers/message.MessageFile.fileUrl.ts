import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import type { TMessageFile } from "../message.types";
import { messageFileStorageService } from "../service/messageFileStorageService";

export const messageFileUrlResolver = async (
    messageFile: TMessageFile,
    _: unknown,
    context: AppQraphQLContext
): Promise<string> => {
    return messageFileStorageService.getFileUrl(messageFile.file_name);
}
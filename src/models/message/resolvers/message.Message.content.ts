import { decrypt } from "../../../utils/cryptoUtils";
import type { TMessage } from "../message.types";

export const messageContent = async (
    parent: TMessage,
): Promise<string> => {
    return decrypt(parent.content);
}
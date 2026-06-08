import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import type { TMessage } from "../message.types";
import messageDBService from "../service/messageDBService";
import type { types } from "cassandra-driver";

export const messageReadsResolver = async (
    message: TMessage,
    _: unknown,
    context: AppQraphQLContext
): Promise<types.Uuid[]> => {
    const reads = await messageDBService.getMessageReads({ message });
    return reads;
};
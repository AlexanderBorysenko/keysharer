import type { types } from "cassandra-driver";
import type { TMessage } from "../message.types";

export const mapRowIntoMessage = (row: types.Row): TMessage => {
    return {
        id: row.id,
        chat_id: row.chat_id,
        content: row.content,
        status: row.status,
        timestamp: row.timestamp,
        type: row.type,
        user_id: row.user_id,
    };
}
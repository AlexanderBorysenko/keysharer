import { types, type ArrayOrObject } from "cassandra-driver";
import { client } from "../../../db/client";
import type { TMessage } from "../message.types";
import { rowToObject } from "../../../utils/rowToObject";
import { getChatUserIds } from "../../chat/service/getChatUserIds";
import type { Chat } from "../../chat/chat.types";

type Queries = Array<string | {
    query: string;
    params?: ArrayOrObject;
}>;

class MessageDBService {
    /**
     * Get messages for a chat
     */
    public GET_MESSAGE_QUERY = `SELECT * FROM messages WHERE id = ?;`;
    public getMessage = async ({ messageId }: {
        messageId: types.TimeUuid;
    }): Promise<TMessage> => {
        const result = (await client.execute(this.GET_MESSAGE_QUERY, [messageId], { prepare: true })).first();
        if (!result) throw new Error('Message not found');
        return rowToObject(result);
    };

    /**
     * Create a new message
     */
    public createMessage = async ({ messageId, chatId, userId, content, type, userIds }: {
        messageId: types.TimeUuid;
        chatId: types.Uuid;
        userId: types.Uuid;
        content: string;
        type?: string;
        userIds?: types.Uuid[];
    }): Promise<void> => {
        let recipientIds: types.Uuid[] = userIds || await getChatUserIds({ chatId });
        recipientIds = recipientIds.filter((id) => id.toString() !== userId.toString());

        const queries: Queries = [
            {
                query: `INSERT INTO messages (id, chat_id, user_id, type, content, timestamp) VALUES (?, ?, ?, ?, ?, toTimestamp(now()))`,
                params: [messageId, chatId, userId, type || 'text', content]
            },
            {
                query: `UPDATE chats SET updated_at = toTimestamp(now()) WHERE id = ?`,
                params: [chatId]
            },
        ];

        try {
            await client.batch(queries, { prepare: true });
            await this.increaseUnreadCount({ chatId, userIds: recipientIds });
        } catch (error) {
            console.error('Failed to create message:', error);
            throw new Error('Failed to create message');
        }
    }

    /**
     * Mark messages as read for a user in a chat
    */
    public readMessage = async ({ chatId, messageId, userId, }: {
        chatId: types.Uuid;
        messageId: types.Uuid;
        userId: types.Uuid;
    }): Promise<void> => {
        try {
            const queries: Queries = [
                {
                    query: `INSERT INTO app_keyspace.message_reads (chat_id, message_id, user_id) VALUES (?, ?, ?)`,
                    params: [chatId, messageId, userId]
                },
                {
                    query: `UPDATE messages SET is_read = true WHERE chat_id = ? AND id = ?`,
                    params: [chatId, messageId]
                }
            ];
            await client.batch(queries, { prepare: true });
            await this.decreaseUnreadCount({ chatId, userId });
        } catch (error) {
            console.error('Failed to mark message as read:', error);
            throw new Error('Failed to mark message as read');
        }
    }

    /**
     * Get the users who have read a message
     */
    public getMessageReads = async ({
        message,
        targetUserIds
    }: {
        message: TMessage;
        targetUserIds?: types.Uuid[];
    }): Promise<types.Uuid[]> => {
        targetUserIds = targetUserIds || await getChatUserIds({
            chatId: message.chat_id,
        });
        const result: types.Uuid[] = [];
        targetUserIds.forEach(async (userId) => {
            if (userId.toString() === message.user_id.toString()) return;

            const read = await client.execute(
                `SELECT user_id FROM app_keyspace.message_reads WHERE chat_id = ? AND user_id = ? AND message_id = ?;`,
                [message.chat_id, userId, message.id],
                { prepare: true }
            );
            if (read.first()) result.push(userId);
        });
        return result;
    }

    public deleteMessageReadsBatch = async ({ chatId, userIds }: {
        chatId: types.Uuid;
        userIds?: types.Uuid[];
    }): Promise<Queries> => {
        userIds = userIds || await getChatUserIds({ chatId });
        return userIds.map(userId => ({
            query: `DELETE FROM app_keyspace.message_reads WHERE chat_id = ? AND user_id = ?`,
            params: [chatId, userId]
        }));
    }

    /**
     * Decrease unread messages count for a user in a chat
     */
    public decreaseUnreadCount = async ({ chatId, userId, }: {
        chatId: types.Uuid;
        userId: types.Uuid;
    }): Promise<boolean> => {
        try {
            await client.execute(
                `UPDATE app_keyspace.user_unread_count SET unread_count = unread_count - 1 WHERE user_id = ? AND chat_id = ?`,
                [userId, chatId],
                { prepare: true }
            );
            return true;
        } catch (error) {
            console.error('Failed to decrease unread count:', error);
            return false;
        }
    }

    /**
     * Increase unread messages count for a user in a chat
     */
    public increaseUnreadCount = async ({ chatId, userIds, }: {
        chatId: types.Uuid;
        userIds: types.Uuid[];
    }): Promise<boolean> => {
        try {
            await Promise.all(userIds.map(userId =>
                client.execute(
                    `UPDATE app_keyspace.user_unread_count SET unread_count = unread_count + 1 WHERE user_id = ? AND chat_id = ?`,
                    [userId, chatId],
                    { prepare: true }
                )
            ));
            return true;
        } catch (error) {
            console.error('Failed to increase unread count:', error);
            return false;
        }
    }

    /**
     * Delete a chat unread counters
     */
    public deleteChatUnreadCounters = async ({ chatId, userIds }: {
        chatId: types.Uuid;
        userIds?: types.Uuid[];
    }): Promise<void> => {
        userIds = userIds || await getChatUserIds({
            chatId,
        });
        try {
            await Promise.all(userIds.map((userId) =>
                client.execute(`DELETE FROM app_keyspace.user_unread_count WHERE chat_id = ? AND user_id = ?`, [chatId, userId], { prepare: true })
            ));
        } catch (error) {
            console.error('Failed to delete chat unread counters:', error);
            throw new Error('Failed to delete chat unread counters');
        }
    }

    /**
     * Delete a message batch
     * DELETE FROM messages WHERE chat_id = ?
     */
    public deleteChatMessagesBatch = async ({ chatId, userIds }: {
        chatId: types.Uuid;
        userIds?: types.Uuid[];
    }): Promise<Queries> => {
        userIds = userIds || await getChatUserIds({
            chatId,
        });
        return [
            {
                query: `DELETE FROM messages WHERE chat_id = ?`,
                params: [chatId]
            },
            ...await this.deleteMessageReadsBatch({ chatId, userIds })
        ];
    }

    /**
     * Get unread messages count for a user in a chat
    */
    public GET_UNREAD_MESSAGES_COUNT_QUERY = `SELECT unread_count FROM app_keyspace.user_unread_count WHERE user_id = ? AND chat_id = ?;`;
    public getUnreadMessagesCount = async ({ userId, chatId, }: {
        userId: types.Uuid;
        chatId: types.Uuid;
    }): Promise<number> => {
        const result = (await client.execute(this.GET_UNREAD_MESSAGES_COUNT_QUERY, [userId, chatId], { prepare: true })).first();

        if (!result) return 0;
        return result.unread_count;
    }
}

const messageDBService = new MessageDBService();
export default messageDBService;
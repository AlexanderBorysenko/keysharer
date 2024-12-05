import type { types } from "cassandra-driver";
import { client } from "../../../db/client";
import type { ChatCard } from "../chat.types";
import { getChatUsersIds } from "./getChatUsersIds";
import { getChatName } from "./getChatName";

export const getChatCard = async (
    chatId: types.Uuid,
    userId: types.Uuid | null = null
): Promise<ChatCard> => {
    // Отримати інформацію про чат
    const chatQuery = 'SELECT id, name, avatar FROM chats WHERE id = ?';
    const chatResult = await client.execute(chatQuery, [chatId], { prepare: true });
    const chat = chatResult.first();

    if (!chat) {
        throw new Error(`Chat with id ${chatId} not found.`);
    }

    // Отримати учасників чату, виключаючи поточного користувача
    const userIds = (await getChatUsersIds(chatId)).filter(id => id !== userId);
    const usersQuery = 'SELECT * FROM users WHERE id IN ?';
    const usersResult = await client.execute(usersQuery, [userIds], { prepare: true });

    const users = usersResult.rows;

    // Формувати ім'я чату, якщо воно порожнє
    let chatName = await getChatName(chatId, userId);

    // Встановити аватар для не-групового чату
    let chatAvatar = chat.avatar;
    if (chatAvatar) {
        chatAvatar = users.length > 0 ? users[0].avatar : null;
    }

    // Підрахувати кількість непрочитаних повідомлень
    const unreadCountQuery = `
      SELECT COUNT(*) AS unread_messages_count
      FROM messages
      WHERE chat_id = ? AND user_id = ? AND status = 'sent'
      ALLOW FILTERING
    `;
    const unreadCountResult = await client.execute(unreadCountQuery, [chatId, userId], { prepare: true });
    const unreadMessagesCount = unreadCountResult.first()?.unread_messages_count || 0;

    return {
        id: chatId,
        name: chatName,
        avatar: chatAvatar,
        unread_messages_count: unreadMessagesCount,
    };
}

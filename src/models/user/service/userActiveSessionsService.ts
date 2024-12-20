import type { ArrayOrObject, types } from "cassandra-driver";
import { client } from "../../../db/client";

type StatusCountAction = 'increment' | 'decrement';

class UserActiveSessionsService {
    /**
     * Get all user ids
     */
    getAllUserIds = async (): Promise<types.Uuid[]> => {
        const query = `SELECT id FROM app_keyspace.users`;
        const result = await client.execute(query, [], { prepare: true });
        return result.rows.map(row => row.id);
    }

    /**
     * Update the active sessions count for a user
     */
    updateUsersActiveSessionsCount = async (userId: types.Uuid, action: StatusCountAction) => {
        const actionQueries: Record<StatusCountAction, string> = {
            increment: `UPDATE app_keyspace.user_active_sessions_count SET active_sessions_count = active_sessions_count + 1 WHERE user_id = ?`,
            decrement: `UPDATE app_keyspace.user_active_sessions_count SET active_sessions_count = active_sessions_count - 1 WHERE user_id = ?`,
        };
        if (action === 'decrement') {
            const previousCount = await this.getUsersActiveSessionsCount(userId);
            if (previousCount === 0) {
                console.log(`User ${userId} active sessions count is already 0`);
                return;
            }
        }

        try {
            await client.execute(actionQueries[action], [userId], { prepare: true });
        } catch (error) {
            console.error(`Failed to update active sessions count for user ${userId}:`, error);
        }
    }

    /**
     * Reset all users active sessions count
     */
    resetAllUsersActiveSessionsCount = async () => {
        await client.execute(`TRUNCATE app_keyspace.user_active_sessions_count`);
    }

    /**
     * Get the active sessions count for a user
     */
    getUsersActiveSessionsCount = async (userId: types.Uuid): Promise<number> => {
        const query = `SELECT active_sessions_count FROM app_keyspace.user_active_sessions_count WHERE user_id = ?`;
        const result = await client.execute(query, [userId], { prepare: true });
        return result.rows[0]?.active_sessions_count || 0;
    }

    isUserOnline = async (userId: types.Uuid): Promise<boolean> => {
        return (await this.getUsersActiveSessionsCount(userId)) > 0;
    }
}

const userActiveSessionsService = new UserActiveSessionsService();
export default userActiveSessionsService;
import { client } from "../../../db/client";
import { types } from "cassandra-driver";
import { userDBMapping, type User } from "../user.types";
import { mapRowIntoUser } from "./mapRowIntoUser";
import bcrypt from "bcrypt";
import { generateAvatar } from "../../../utils/generateAvatar";
import { avatarImageStorageService } from "../../../services/avatarImageStorageService";

class UserDBService {
    async findUserById(id: types.Uuid): Promise<User | undefined> {
        const query = "SELECT * FROM users WHERE id = ?";
        const result = await client.execute(query, [id], { prepare: true });
        if (result.rowLength === 0) {
            return undefined;
        }
        return mapRowIntoUser(result.first());
    }

    async findUserByUsername(username: string): Promise<User | undefined> {
        const query = "SELECT * FROM users WHERE username = ?";
        const result = await client.execute(query, [username], { prepare: true });
        if (result.rowLength === 0) {
            return undefined;
        }
        return mapRowIntoUser(result.first());
    }

    async createUser(user: User): Promise<void> {
        if (!user.avatar) {
            const avatarBuffer = generateAvatar();
            user.avatar = types.Uuid.random().toString() + '.png';
            await avatarImageStorageService.putAvatarToStorageFromBuffer(avatarBuffer, user.avatar);
        }
        const fields = Object.keys(userDBMapping).filter(key => user[key as keyof User] !== undefined) as (keyof User)[];
        const columns = fields.map(field => userDBMapping[field as keyof typeof userDBMapping]);
        const placeholders = fields.map(() => '?');
        const query = `INSERT INTO users (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;

        const hashedPassword = user.password ? await bcrypt.hash(user.password, 10) : undefined;
        const params = fields.map(field => field === 'password' ? hashedPassword : user[field as keyof User]);
        await client.execute(query, params, { prepare: true });
    }

    async updateUser(user: User): Promise<void> {
        const fields = Object.keys(userDBMapping).filter(key => user[key as keyof User] !== undefined) as (keyof User)[];
        const assignments = fields.map(field => `${userDBMapping[field as keyof typeof userDBMapping]} = ?`);
        const query = `UPDATE users SET ${assignments.join(', ')} WHERE id = ?`;

        const hashedPassword = user.password ? await bcrypt.hash(user.password, 10) : undefined;
        const params = fields.map(field => field === 'password' ? hashedPassword : user[field as keyof User]);
        params.push(user.id);
        await client.execute(query, params, { prepare: true });
    }

    async deleteUser(id: types.Uuid): Promise<void> {
        const query = "DELETE FROM users WHERE id = ?";
        await client.execute(query, [id], { prepare: true });
    }

    async getUserChatJoinTime({ userId, chatId }: { userId: types.Uuid, chatId: types.Uuid }): Promise<Date | undefined> {
        const query = "SELECT timestamp FROM user_chat WHERE user_id = ? AND chat_id = ?";
        const result = await client.execute(query, [userId, chatId], { prepare: true });
        if (result.rowLength === 0) {
            return undefined;
        }
        return result.first().get("timestamp");
    }
}

const userDBService = new UserDBService();

export default userDBService;
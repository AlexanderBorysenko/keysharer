import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { isAuthenticatedMiddleware } from "../middleware/isAuthenticatedMiddleware";
import { client } from "../../../db/client";
import { avatarImageStorageService } from "../../../services/avatarImageStorageService";
import { ValidationService, validationService } from "../../../services/validationService";
import { getUserChatsIds } from "../../chat/service/getUserChatsIds";
import { publishChatUpdated } from "../../chat/resolvers/chat.chatUpdated.subscription";
import { publishUserUpdated } from "./user.userUpdated.subscription";

export type UpdateUserInput = {
    displayName?: string;
    avatar?: File;
};

export const updateUserDefs = `
scalar File

input UpdateUserInput {
    displayName: String
    avatar: File
}

type Mutation {
    updateUser(input: UpdateUserInput!): Boolean!
}
`;

export const updateUser = async (
    _: unknown,
    { input: { displayName, avatar } }: { input: UpdateUserInput },
    context: AppQraphQLContext
): Promise<boolean> => {
    const user = await isAuthenticatedMiddleware(context);
    await ValidationService.validate({
        displayName: [
            () => {
                if (!displayName) {
                    return "Name is required";
                } else if (displayName.length > 24) {
                    return "Name Must be less than 24 characters";
                }
                return null;
            }
        ],
        avatar: [
            () => {
                if (avatar) {
                    const allowedExtensions = ["jpeg", "jpg", "png"];
                    const fileExtension = avatar.name.split(".").pop() || "";
                    if (!allowedExtensions.includes(fileExtension)) {
                        return "Invalid file type. Only jpeg, jpg and png are allowed";
                    }
                }
                return null;
            }
        ]
    }, { displayName, avatar });

    const queries: string[] = [];
    const params: any[] = [];

    // Update display name if provided
    if (displayName) {
        displayName = displayName.trim();

        queries.push("UPDATE users SET display_name = ? WHERE id = ?");
        params.push(displayName, user.id);
    }

    if (avatar) {
        try {
            if (user.avatar) avatarImageStorageService.deleteAvatarFile(user.avatar);
            const { filePath } = await avatarImageStorageService.createAvatarFile(avatar);
            queries.push("UPDATE users SET avatar = ? WHERE id = ?");
            params.push(filePath, user.id);
        } catch (err) {
            console.error("Error updating avatar", err);
            throw new Error("Error updating avatar");
        }
    }

    if (queries.length > 0) {
        try {
            await client.batch(
                queries.map((query, index) => ({ query, params: params.slice(index * 2, index * 2 + 2) })),
                { prepare: true }
            );

            await publishUserUpdated(user.id);
            const userChats = await getUserChatsIds(user.id);
            userChats.forEach(chatId => publishChatUpdated(chatId));
        } catch (error) {
            console.error("Error updating user", error);
            throw new Error("Error updating user");
        }
    }

    return true;
};
import { avatarImageStorageService } from "../../../services/avatarImageStorageService";
import type { User } from "../user.types";

const userAvatarResolver = (parent: User): string | null => {
    return parent.avatar ? avatarImageStorageService.formatAvatarUrl(parent.avatar) : null;
};

export default userAvatarResolver;
import userActiveSessionsService from "../../user/service/userActiveSessionsService";
import type { User } from "../user.types";

export const isOnline = async (user: User, _: any): Promise<boolean> => {
    return userActiveSessionsService.isUserOnline(user.id);
};
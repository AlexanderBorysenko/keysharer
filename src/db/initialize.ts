import userActiveSessionsService from '../models/user/service/userActiveSessionsService';

export const initializeDatabase = async () => {
    await userActiveSessionsService.resetAllUsersActiveSessionsCount();
}
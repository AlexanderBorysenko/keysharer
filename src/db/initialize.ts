import { types } from 'cassandra-driver';
import userActiveSessionsService from '../models/user/service/userActiveSessionsService';
import userDBService from '../models/user/service/userDBService';
import { Role } from '../models/user/user.types';

export const initializeDatabase = async () => {
    await userActiveSessionsService.resetAllUsersActiveSessionsCount();

    if (!(await userDBService.findUserByUsername('ElonMusk'))) {
        userDBService.createUser({
            id: types.Uuid.random(),
            username: 'ElonMusk',
            email: 'elon@gmail.com',
            emailVerified: true,
            password: 'Password@123',
            role: Role.USER,
            avatar: '/public/avatars/6b0ba444-1f03-41b8-b424-999546739827.png',
            displayName: 'Elon Musk'
        })
    }
    if (!(await userDBService.findUserByUsername('DonaldTrump'))) {
        userDBService.createUser({
            id: types.Uuid.random(),
            username: 'DonaldTrump',
            email: 'donald@gmail.com',
            emailVerified: true,
            password: 'Password@123',
            role: Role.USER,
            avatar: '/public/avatars/a5032379-cf87-4b98-9e47-8770db9b5f66.png',
            displayName: 'Donald Trump'
        });
    }
}
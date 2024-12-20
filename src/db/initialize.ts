import { types } from 'cassandra-driver';
import userActiveSessionsService from '../models/user/service/userActiveSessionsService';
import userDBService from '../models/user/service/userDBService';
import { Role } from '../models/user/user.types';

export const initializeDatabase = async () => {
    await userActiveSessionsService.resetAllUsersActiveSessionsCount();

    if (!(await userDBService.findUserByUsername('ElonMusk'))) {
        userDBService.createUser({
            id: types.Uuid.random(),
            username: 'Igor',
            email: 'elon@gmail.com',
            emailVerified: true,
            password: 'Password@123',
            role: Role.USER,
            avatar: '',
            displayName: 'Igor'
        })
    }
    if (!(await userDBService.findUserByUsername('ElonMusk'))) {
        userDBService.createUser({
            id: types.Uuid.random(),
            username: 'Yurii',
            email: 'elon@gmail.com',
            emailVerified: true,
            password: 'Password@123',
            role: Role.USER,
            avatar: '',
            displayName: 'Yurii'
        })
    }
    if (!(await userDBService.findUserByUsername('ElonMusk'))) {
        userDBService.createUser({
            id: types.Uuid.random(),
            username: 'Alex',
            email: 'elon@gmail.com',
            emailVerified: true,
            password: 'Password@123',
            role: Role.USER,
            avatar: '',
            displayName: 'Alex'
        })
    }
    if (!(await userDBService.findUserByUsername('ElonMusk'))) {
        userDBService.createUser({
            id: types.Uuid.random(),
            username: 'ElonMusk',
            email: 'elon@gmail.com',
            emailVerified: true,
            password: 'Password@123',
            role: Role.USER,
            avatar: '',
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
            avatar: '',
            displayName: 'Donald Trump'
        });
    }
    if (!(await userDBService.findUserByUsername('BillGates'))) {
        userDBService.createUser({
            id: types.Uuid.random(),
            username: 'BillGates',
            email: '',
            emailVerified: true,
            password: 'Password@123',
            role: Role.USER,
            avatar: '',
            displayName: 'Bill Gates'
        });
    }
}
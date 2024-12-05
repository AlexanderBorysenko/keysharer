import { ValidationService } from "../../../services/validationService"
import bcrypt from 'bcrypt';
import { client } from "../../../db/client";
import { isUniqueField } from "../../../db/utils/isUniqueField";
import { types } from "cassandra-driver";

type CreateUserRequest = {
    username: string;
    email: string;
    password: string;
    confirm_password: string;
}

export const createUserMutationDef = `createUser(username: String!, email: String!, password: String!, confirm_password: String!): User!`;
export const createUser = async (
    _: any,
    args: CreateUserRequest
) => {
    await ValidationService.validate({
        username: [
            (value: any) => (!value ? 'Name is Required' : null),
            async () => await isUniqueField('users', 'username', args.username) ? null : 'Username is taken'
        ],
        email: [
            (value: any) => (!value ? 'Email is Required' : null),
            (value: any) => (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email format' : null),
            async () => await isUniqueField('users', 'email', args.email) ? null : 'Email is already in use'
        ],
        password: [
            () =>
                (args.password.length <= 8 || !/[!@#$%^&*(),.?":{}|<>+_-]/.test(args.password)) ? 'Password must be at least 8 characters long and contain at least one special character' : null
        ],
        confirm_password: [
            () => (args.confirm_password !== args.password) ? 'Passwords do not match' : null
        ]
    }, { ...args });

    const id = types.Uuid.random();

    const hashedPassword = await bcrypt.hash(args.password, 10);
    const params = [id, args.username, args.email, hashedPassword];

    const query = `INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)`;

    await client.execute(query, params, { prepare: true });

    // Повертаємо створеного користувача (без пароля)
    return {
        id,
        username: args.username,
        email: args.email,
    };
}
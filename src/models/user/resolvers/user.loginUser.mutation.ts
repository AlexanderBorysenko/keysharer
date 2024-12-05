import { throwUserInputError } from "../../../errors/throwUserInputError";
import { client } from "../../../db/client";
import { ValidationService } from "../../../services/validationService";
import bcrypt from 'bcrypt';
import { createJWTToken } from "../service/createJWTToken";
import { findUser } from "../service/findUser";

export type LoginUserMutationRequest = {
    username: string;
    password: string;
};

export const loginUserMutationDef = `loginUser(username: String!, password: String!): AuthPayload!`;

export const loginUser = async (parent: any, { username, password }: LoginUserMutationRequest) => {
    await ValidationService.validate({
        username: [
            (value: any) => (!value ? 'Username is required.' : null),
        ],
        password: [
            (value: any) => (!value ? 'Password is required.' : null),
        ],
    }, { username, password });

    const user = await findUser({ username });

    if (!user) return throwUserInputError('Invalid username or password.');

    // Compare provided password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user?.password || '');
    if (!isPasswordValid) throwUserInputError('Invalid username or password.');

    // Generate JWT token
    const token = createJWTToken(user);

    // Return token and user data
    return {
        token,
        user,
    };

}
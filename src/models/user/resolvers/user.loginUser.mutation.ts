import { throwUserInputError } from "../../../errors/throwUserInputError";
import { ValidationService } from "../../../services/validationService";
import bcrypt from 'bcrypt';
import { createJWTToken } from "../service/createJWTToken";
import { findUser } from "../service/findUser";
import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";

export type LoginUserInput = {
    username: string;
    password: string;
};

export const loginUserDefs = `
input LoginUserInput {
    username: String!
    password: String!
}

type AuthPayload {
    token: String!
    user: User!
}

type Mutation {
    loginUser(input: LoginUserInput!): AuthPayload!
}
`;

export const loginUser = async (parent: any, { input }: { input: LoginUserInput }, context: AppQraphQLContext) => {
    await ValidationService.validate({
        username: [
            (value: any) => (!value ? 'Username is required.' : null),
        ],
        password: [
            (value: any) => (!value ? 'Password is required.' : null),
        ],
    }, input);

    const user = await findUser({ username: input.username });

    if (!user) return throwUserInputError('Invalid username or password.');

    // Compare provided password with stored hash
    const isPasswordValid = await bcrypt.compare(input.password, user?.password || '');
    if (!isPasswordValid) throwUserInputError('Invalid username or password.');

    // Generate JWT token
    const token = createJWTToken(user);

    // send token as Authorization cookie
    context.request.cookieStore?.set({
        name: 'Authorization',
        value: token,
        httpOnly: true,
        secure: process.env.IS_DEV ? false : true,
        sameSite: 'strict',
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        domain: process.env.CLIENT_URL,
        path: '/',
    });

    // Return token and user data
    return {
        token,
        user,
    };

}
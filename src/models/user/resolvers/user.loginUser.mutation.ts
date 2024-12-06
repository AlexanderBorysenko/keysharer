import { throwUserInputError } from "../../../errors/throwUserInputError";
import { client } from "../../../db/client";
import { ValidationService } from "../../../services/validationService";
import bcrypt from 'bcrypt';
import { createJWTToken } from "../service/createJWTToken";
import { findUser } from "../service/findUser";

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
<<<<<<< HEAD
=======

export const loginUser = async (parent: any, { input }: { input: LoginUserInput }) => {
>>>>>>> 97a8b6f124f2183c0e51489470ba97596ec7d622

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

    // Return token and user data
    return {
        token,
        user,
    };

}
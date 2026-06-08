import { ValidationService } from "../../../services/validationService";
import bcrypt from "bcrypt";
import { client } from "../../../db/client";
import { isUniqueField } from "../../../db/utils/isUniqueField";
import { types } from "cassandra-driver";
import { Role } from "../user.types";
import { send } from "process";
import { sendEmailVerification } from "./user.sendEmailVerification.mutation";
import userDBService from "../service/userDBService";

type CreateUserInput = {
	username: string;
	email: string;
	password: string;
	confirm_password: string;
};

export const createUserDefs = `
input CreateUserInput {
    username: String!
    email: String!
    password: String!
    confirm_password: String!
}

type Mutation {
    createUser(input: CreateUserInput!): User!
}
`;

export const createUser = async (
	_: any,
	{
		input: { username, email, password, confirm_password },
	}: { input: CreateUserInput }
) => {
	await ValidationService.validate(
		{
			username: [
				(value: any) => (!value ? "Username is Required" : null),
				(value: any) =>
					value.length < 4
						? "Username must be at least 4 characters long"
						: null,
				(value: any) =>
					value.length > 20
						? "Username must be at most 20 characters long"
						: null,
				(value: any) =>
					!/^[a-zA-Z0-9_]+$/.test(value)
						? "Username can only contain letters, numbers, and underscores"
						: null,
				async () =>
					(await isUniqueField("users", "username", username))
						? null
						: "Username is taken",
			],
			email: [
				(value: any) => (!value ? "Email is Required" : null),
				(value: any) =>
					!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
						? "Invalid email format"
						: null,
				(value: any) =>
					value.length > 255
						? "Email must be at most 255 characters long"
						: null,
				async () =>
					(await isUniqueField("users", "email", email))
						? null
						: "Email is already in use",
			],
			password: [
				(value: any) => (!value ? "Password is required." : null),
				(value: string) =>
					value.length <= 8 ||
						!/[!@#$%^&*(),.?":{}|<>+_-]/.test(value)
						? "Password must be at least 8 characters long and contain at least one special character"
						: null,
				(value: string) => value.length >= 20 ? "Password must be at most 20 characters long" : null,
			],
			confirm_password: [
				(value) =>
					confirm_password !== password
						? "Passwords do not match"
						: null,
			],
		},
		{
			username,
			email,
			password,
			confirm_password,
		}
	);

	const id = types.Uuid.random();
	await userDBService.createUser({
		id: types.Uuid.random(),
		username,
		email,
		displayName: username,
		password,
		emailVerified: false,
		role: Role.USER,
	});

	// Return the created user (without password)
	return {
		id,
		username,
		email,
	};
};

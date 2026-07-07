import { types } from "cassandra-driver";
import userActiveSessionsService from "../models/user/service/userActiveSessionsService";
import userDBService from "../models/user/service/userDBService";
import { Role } from "../models/user/user.types";

export const initializeDatabase = async () => {
	await userActiveSessionsService.resetAllUsersActiveSessionsCount();

	// Demo/seed users are for local development only — never seed these on a
	// production boot.
	if (!process.env.IS_DEV) {
		return;
	}

	const users = [
		{ username: "Igor", email: "elon@gmail.com", displayName: "Igor" },
		{ username: "Yurii", email: "elon@gmail.com", displayName: "Yurii" },
		{ username: "Alex", email: "elon@gmail.com", displayName: "Alex" },
		{
			username: "ElonMusk",
			email: "elon@gmail.com",
			displayName: "Elon Musk",
		},
		{
			username: "DonaldTrump",
			email: "donald@gmail.com",
			displayName: "Donald Trump",
		},
		{
			username: "BillGates",
			email: "bill@gmail.com",
			displayName: "Bill Gates",
		},
		{
			username: "JeffBezos",
			email: "jeff@gmail.com",
			displayName: "Jeff Bezos",
		},
		{
			username: "MarkZuckerberg",
			email: "mark@gmail.com",
			displayName: "Mark Zuckerberg",
		},
		{
			username: "WarrenBuffet",
			email: "warren@gmail.com",
			displayName: "Warren Buffet",
		},
	];

	for (const user of users) {
		if (!(await userDBService.findUserByUsername(user.username))) {
			await userDBService.createUser({
				id: types.Uuid.random(),
				username: user.username,
				email: user.email,
				emailVerified: true,
				password: "Password@123",
				role: Role.USER,
				avatar: "",
				displayName: user.displayName,
			});
		}
	}
};

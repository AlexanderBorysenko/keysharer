import jwt from "jsonwebtoken";
import type { User } from "../user.types";

export const createUserJWTToken = (user: User) => {
	return jwt.sign(
		{ userId: user.id, scope: user.role },
		process.env.JWT_SECRET,
		{
			expiresIn: "15m",
		}
	);
};

export const createGuestJWTToken = (user: User) => {
	return jwt.sign(
		{ userId: user.id, scope: user.role },
		process.env.JWT_SECRET,
		{
			expiresIn: "1h",
		}
	);
};

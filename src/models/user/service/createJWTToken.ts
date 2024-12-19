import jwt from "jsonwebtoken";
import type { User } from "../user.types";

export const createUserAccessToken = (user: User) => {
	return jwt.sign(
		{ userId: user.id, scope: user.role },
		process.env.JWT_SECRET,
		{
			expiresIn: "15m",
		}
	);
};

export const createUserRefreshToken = (user: User) => {
	return jwt.sign(
		{ userId: user.id, scope: user.role },
		process.env.JWT_SECRET,
		{
			expiresIn: "7d",
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

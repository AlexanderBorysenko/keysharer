import jwt from "jsonwebtoken";
import type { User } from "../user.types";

export const createJWTToken = (user: User) => {
	return jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
		expiresIn: "15m",
	});
};

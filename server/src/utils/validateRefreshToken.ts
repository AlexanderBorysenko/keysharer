import jwt from "jsonwebtoken";
import { throwUnauthenticatedError } from "../errors/throwUnauthenticatedError";
import { findUser } from "../models/user/service/findUser";
import type { User } from "../models/user/user.types";

export const validateRefreshToken = async (token: string): Promise<User> => {
	try {
		const decoded: any = jwt.verify(token, process.env.JWT_SECRET);

		const user = await findUser({ id: decoded.userId });

		if (!user) throw new Error("User not found");

		return user;
	} catch (err) {
		console.error("Error verifying token: ", err);
		return throwUnauthenticatedError("Invalid refresh token");
	}
};

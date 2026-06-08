import type { User } from "../user.types";

const userDisplayNameResolver = (parent: User): string => {
	if (parent.displayName) {
		return parent.displayName;
	}
	return `@${parent.username}`;
};

export default userDisplayNameResolver;

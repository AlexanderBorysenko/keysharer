export const getCookieFromCookiesString = (
	cookiesString: string,
	cookieName: string
): string | null => {
	const cookies = cookiesString.split("; ");
	for (const cookie of cookies) {
		const [name, value] = cookie.split("=");
		if (name === cookieName) {
			return value;
		}
	}

	return null;
};

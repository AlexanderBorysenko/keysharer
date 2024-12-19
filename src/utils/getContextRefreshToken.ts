import { getCookieFromCookiesString } from "./getCookieFromCookiesString";

export function getContextRefreshToken(context: any): string | null {
	const headerCookie = context?.request?.headers?.get("cookie");
	if (headerCookie) {
		const refreshToken = getCookieFromCookiesString(
			headerCookie,
			"httpOnly_refresh_token"
		);
		if (refreshToken) return refreshToken;
	}

	return null;
}

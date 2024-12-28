import { getCookieFromCookiesString } from "./getCookieFromCookiesString";

export function getContextRefreshToken(context: any): string | null {
	if (context?.request?.headers) {
		const request = context.request;
		const refreshToken =
			request.headers.get("refresh_token");
		if (refreshToken) return refreshToken;
	}

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

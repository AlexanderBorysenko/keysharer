import type { AppQraphQLContext } from "../../types/AppQraphQLContext";
import { getCookieFromCookiesString } from "./getCookieFromCookiesString";

function getJWTFromStr(str: string): string | null {
	if (str.startsWith("Bearer ")) {
		return str.substring(7);
	}
	return null;
}

export function getContextJWTToken(context: any): string | null {
	// Get authorization from context extensions
	if (context?.params?.extensions?.headers?.Authorization) {
		return getJWTFromStr(context.params.extensions.headers.Authorization);
	}

	// Get authorization for WS connection
	if (context?.connectionParams?.authorization) {
		return context.connectionParams.authorization; // receiving withot Bearer
	}

	// Get from classic http request cookies
	// const headerCookie = context?.request?.headers?.get("cookie");
	// if (headerCookie) {
	// 	const authCookie = getCookieFromCookiesString(
	// 		headerCookie,
	// 		"Authorization"
	// 	);
	// 	if (authCookie) return authCookie;
	// }

	// Get from classic http request headers
	if (context?.request?.headers) {
		const request = context.request;
		const authHeader =
			request.headers.get("Authorization") ||
			request.headers.get("authorization");
		if (authHeader) return getJWTFromStr(authHeader);
	}

	return null;
}

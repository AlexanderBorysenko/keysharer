import type { AppQraphQLContext } from "../../types/AppQraphQLContext";
import { getCookieFromCookiesString } from "./getCookieFromCookiesString";

function getJWTFromStr(str: string): string | null {
	if (str.startsWith("Bearer ")) {
		return str.substring(7);
	}
	return null;
}

export function getContextJWTToken(context: AppQraphQLContext): string | null {
	if (process.env.IS_DEV) {
		if (context.params.extensions?.headers?.Authorization) {
			return getJWTFromStr(
				context.params.extensions.headers.Authorization
			);
		}
		//@ts-ignore
		if (context?.connectionParams?.authorization)
			//@ts-ignore
			return getJWTFromStr(context.connectionParams.authorization);

		if (context.request) {
			const request = context.request;
			const authHeader = request.headers.get("Authorization");
			if (authHeader) return getJWTFromStr(authHeader);
		}
	} else {
		const headerCookie = context?.request?.headers?.get("cookie");
		if (headerCookie) {
			const authCookie = getCookieFromCookiesString(
				headerCookie,
				"Authorization"
			);
			if (authCookie) return authCookie;
		}

		// Handle WebSocket connectionParams
		const connectionParamsAuthorization =
			//@ts-ignore
			context?.connectionParams?.authorization;
		if (connectionParamsAuthorization) {
			return connectionParamsAuthorization;
		}
	}

	return null;
}

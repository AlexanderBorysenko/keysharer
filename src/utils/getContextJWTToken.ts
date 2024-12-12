import type { AppQraphQLContext } from "../../types/AppQraphQLContext";
import { getCookieFromCookiesString } from "./getCookieFromCookiesString";

function getJWTFromStr(str: string): string | null {
    if (str.startsWith('Bearer ')) {
        return str.substring(7);
    }
    return null;
}

export function getContextJWTToken(context: AppQraphQLContext): string | null {
    const headerCookie = context?.request?.headers?.get('cookie');
    if (headerCookie) {
        const authCookie = getCookieFromCookiesString(headerCookie, 'Authorization');
        if (authCookie) return authCookie;
    }

    // Handle WebSocket connectionParams
    //@ts-ignore
    const connectionParamsAuthorization = context?.connectionParams?.authorization;
    if (connectionParamsAuthorization) {
        return connectionParamsAuthorization;
    }

    return null;
}
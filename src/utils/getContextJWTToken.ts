import type { AppQraphQLContext } from "../../types/AppQraphQLContext";

function getJWTFromStr(str: string): string | null {
    if (str.startsWith('Bearer ')) {
        return str.substring(7);
    }
    return null;
}

export function getContextJWTToken(context: AppQraphQLContext): string | null {
    if (context.params.extensions?.headers?.Authorization) {
        return getJWTFromStr(context.params.extensions.headers.Authorization);
    }
    if (context.request) {
        const request = context.request;
        const authHeader = request.headers.get('Authorization');
        if (authHeader) return getJWTFromStr(authHeader);
    }

    return null;
}
import { isLocalhostRequest } from "../../../utils/isLocalhostRequest";

export const logoutUserDefs = `
type Mutation {
    logoutUser: Boolean!
}`;


export const logoutUser = async (parent: any, args: any, context: any): Promise<boolean> => {
    // Clear the refresh token cookie
    if (isLocalhostRequest(context)) return true;
    try {
        await context.request.cookieStore?.set({
            name: "httpOnly_refresh_token",
            value: "",
            httpOnly: true,
            sameSite: "lax",
            secure: !process.env.IS_DEV,
            expires: new Date(0), // Set the expiration date to the past to delete the cookie
            domain: process.env.COOKIE_DOMAIN,
            path: "/",
        });
    } catch (e) {
        console.error(e);
    }

    return true;
};
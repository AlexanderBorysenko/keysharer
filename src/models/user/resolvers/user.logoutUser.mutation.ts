export const logoutUserDefs = `
type Mutation {
    logoutUser: Boolean!
}`;


export const logoutUser = async (parent: any, args: any, context: any): Promise<boolean> => {
    // Clear the refresh token cookie
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

    return true;
};
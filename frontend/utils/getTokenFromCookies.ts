export const getTokenFromCookies = (cookies: string | undefined) => {
    if (!cookies) return null;
    const cookie = cookies.split(';').find((cookie) => cookie.trim().startsWith('token='));
    return cookie?.split('=')[1];
}
import { randomInt } from "crypto";

// Note: current caller (generateUniqueUsername.ts) uses this only for a
// display-facing fallback username, not a secret/token. Converted anyway to
// a CSPRNG as a drop-in improvement with no downside, and so any future
// security-sensitive caller gets a safe default.
export const generateRandomString = (length: number): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(randomInt(0, chars.length));
    }
    return result;
}

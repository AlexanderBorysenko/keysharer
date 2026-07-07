import { throwTooManyRequestsError } from "../errors/throwTooManyRequestsError";

/**
 * A tiny, dependency-free sliding-window failure counter.
 *
 * This is intentionally process-local / in-memory (a `Map<string, number[]>`
 * of failure timestamps kept in this module's closure). It protects a single
 * server instance from brute-force attempts (e.g. repeated bad login /
 * verification-code guesses). If the app is ever scaled horizontally across
 * multiple instances, this must be replaced with a shared store (e.g.
 * Redis) so limits are enforced across all instances rather than per-process.
 */

const failuresByKey = new Map<string, number[]>();

// Drop timestamps older than `windowMs` and update (or delete) the entry.
const prune = (key: string, windowMs: number): number[] => {
    const timestamps = failuresByKey.get(key);
    if (!timestamps || timestamps.length === 0) return [];

    const cutoff = Date.now() - windowMs;
    const kept = timestamps.filter((timestamp) => timestamp > cutoff);

    if (kept.length === 0) {
        failuresByKey.delete(key);
    } else {
        failuresByKey.set(key, kept);
    }

    return kept;
};

/**
 * Throws a 429 (`throwTooManyRequestsError`) if `key` already has `max` or
 * more recorded failures within the trailing `windowMs`. Call this before
 * performing the guarded action (e.g. checking a password).
 */
export const assertNotRateLimited = (
    key: string,
    max: number,
    windowMs: number
): void => {
    const timestamps = prune(key, windowMs);

    if (timestamps.length >= max) {
        throwTooManyRequestsError(
            "Too many attempts. Please try again later."
        );
    }
};

/**
 * Records a failed attempt for `key`, pruning any timestamps that have
 * already fallen outside `windowMs`.
 */
export const recordFailure = (key: string, windowMs: number): void => {
    const timestamps = prune(key, windowMs);
    timestamps.push(Date.now());
    failuresByKey.set(key, timestamps);
};

/**
 * Clears all recorded failures for `key` (e.g. after a successful login).
 */
export const clearFailures = (key: string): void => {
    failuresByKey.delete(key);
};

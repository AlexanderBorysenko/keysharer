/**
 * Pending "offline" presence-publish timers, keyed by `userId.toString()`.
 *
 * `publishOnlineStatusChanged` debounces offline transitions so a brief
 * disconnect (network blip, or the client's ~25-minute token-refresh
 * reconnect) doesn't flap a watcher's view of presence from online to
 * offline and back. Instead of publishing `false` the moment a user's
 * session count hits 0, a timer is armed here; if the user reconnects
 * before it fires, the timer is cancelled and `false` is never published.
 *
 * In-memory only: timers are lost on process restart, which is acceptable
 * here (a restart naturally invalidates in-flight presence anyway).
 */
export const pendingOfflinePublishTimers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Cancels and removes any pending offline-publish timer for a user, if one
 * exists. Safe to call when no timer is pending.
 */
export const clearPendingOfflinePublish = (userId: string): void => {
	const timer = pendingOfflinePublishTimers.get(userId);
	if (timer !== undefined) {
		clearTimeout(timer);
		pendingOfflinePublishTimers.delete(userId);
	}
};

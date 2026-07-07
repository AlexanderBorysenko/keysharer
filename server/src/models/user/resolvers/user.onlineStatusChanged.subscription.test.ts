import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import { types } from "cassandra-driver";
import { publishOnlineStatusChanged } from "./user.onlineStatusChanged.subscription";
import { pubsub } from "../../../graphql/pubSub";
import userActiveSessionsService from "../service/userActiveSessionsService";
import { clearPendingOfflinePublish, pendingOfflinePublishTimers } from "../storage/usersOfflineDebounceStorage";

// Short grace period so tests can drive the debounce with real setTimeout /
// await sleeps instead of faking timers (bun:test's setSystemTime only
// controls Date, not setTimeout). publishOnlineStatusChanged reads
// PRESENCE_OFFLINE_GRACE_MS fresh on every call, so setting it here is
// picked up immediately without a module reload.
const GRACE_MS = 20;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("publishOnlineStatusChanged (offline debounce)", () => {
	let isUserOnlineSpy: ReturnType<typeof spyOn>;
	let publishSpy: ReturnType<typeof spyOn>;
	let userId: types.Uuid;
	let key: string;

	beforeEach(() => {
		process.env.PRESENCE_OFFLINE_GRACE_MS = String(GRACE_MS);
		userId = types.Uuid.fromString(crypto.randomUUID());
		key = userId.toString();
		isUserOnlineSpy = spyOn(userActiveSessionsService, "isUserOnline");
		publishSpy = spyOn(pubsub, "publish").mockImplementation(() => {});
	});

	afterEach(() => {
		isUserOnlineSpy.mockRestore();
		publishSpy.mockRestore();
		clearPendingOfflinePublish(key);
		delete process.env.PRESENCE_OFFLINE_GRACE_MS;
	});

	it("(a) publishes true immediately when online, and cancels a pending offline timer", async () => {
		// Arm a pending offline timer first (as if a disconnect just happened).
		isUserOnlineSpy.mockImplementation(async () => false);
		await publishOnlineStatusChanged({ userId });
		expect(pendingOfflinePublishTimers.has(key)).toBe(true);
		publishSpy.mockClear();

		// Reconnect: isUserOnline now reports true.
		isUserOnlineSpy.mockImplementation(async () => true);
		await publishOnlineStatusChanged({ userId });

		expect(publishSpy).toHaveBeenCalledTimes(1);
		expect(publishSpy).toHaveBeenCalledWith(`ONLINE_STATUS_CHANGED_${key}`, true);
		expect(pendingOfflinePublishTimers.has(key)).toBe(false);

		// Confirm the cancelled timer doesn't fire a stale publish later.
		await sleep(GRACE_MS * 2);
		expect(publishSpy).toHaveBeenCalledTimes(1);
	});

	it("(b) does not publish false synchronously when going offline", async () => {
		isUserOnlineSpy.mockImplementation(async () => false);

		await publishOnlineStatusChanged({ userId });

		expect(publishSpy).not.toHaveBeenCalled();
		expect(pendingOfflinePublishTimers.has(key)).toBe(true);
	});

	it("(c) publishes false after the grace period elapses if still offline", async () => {
		isUserOnlineSpy.mockImplementation(async () => false);

		await publishOnlineStatusChanged({ userId });
		expect(publishSpy).not.toHaveBeenCalled();

		await sleep(GRACE_MS * 3);

		expect(publishSpy).toHaveBeenCalledTimes(1);
		expect(publishSpy).toHaveBeenCalledWith(`ONLINE_STATUS_CHANGED_${key}`, false);
		expect(pendingOfflinePublishTimers.has(key)).toBe(false);
	});

	it("(d) a reconnect during the grace period cancels the offline publish", async () => {
		isUserOnlineSpy.mockImplementation(async () => false);
		await publishOnlineStatusChanged({ userId });
		expect(publishSpy).not.toHaveBeenCalled();

		// Reconnect partway through the grace period.
		await sleep(GRACE_MS / 2);
		isUserOnlineSpy.mockImplementation(async () => true);
		await publishOnlineStatusChanged({ userId });

		expect(publishSpy).toHaveBeenCalledTimes(1);
		expect(publishSpy).toHaveBeenCalledWith(`ONLINE_STATUS_CHANGED_${key}`, true);

		// Wait past the original timer's fire time; it must not have published
		// a stale `false` after the reconnect.
		await sleep(GRACE_MS * 2);
		expect(publishSpy).toHaveBeenCalledTimes(1);
	});

	it("resolves promptly rather than blocking for the grace period", async () => {
		isUserOnlineSpy.mockImplementation(async () => false);

		const start = performance.now();
		await publishOnlineStatusChanged({ userId });
		const elapsed = performance.now() - start;

		expect(elapsed).toBeLessThan(GRACE_MS);
	});
});

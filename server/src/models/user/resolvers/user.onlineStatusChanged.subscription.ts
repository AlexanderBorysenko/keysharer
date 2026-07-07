import type { AppQraphQLContext } from "../../../../types/AppQraphQLContext";
import { pubsub } from "../../../graphql/pubSub";
import { isAuthenticatedMiddleware } from "../middleware/isAuthenticatedMiddleware";
import { types } from "cassandra-driver";
import userActiveSessionsService from "../service/userActiveSessionsService";
import type { User } from "../user.types";
import { findUser } from "../service/findUser";
import { pendingOfflinePublishTimers, clearPendingOfflinePublish } from "../storage/usersOfflineDebounceStorage";

const DEFAULT_PRESENCE_OFFLINE_GRACE_MS = 15000;

/**
 * Read each time (not cached at module load) so ops can tune it via env
 * without a restart-sensitive cache, and so tests can override it per case.
 */
const getPresenceOfflineGraceMs = (): number => {
	const raw = process.env.PRESENCE_OFFLINE_GRACE_MS;
	const parsed = raw ? Number(raw) : NaN;
	if (Number.isInteger(parsed) && parsed > 0) {
		return parsed;
	}
	return DEFAULT_PRESENCE_OFFLINE_GRACE_MS;
};

export const onlineStatusChangedDefs = `
type Subscription {
    onlineStatusChanged(userId: ID!): Boolean!
}
`;

export const onlineStatusChangedSubscription = {
	subscribe: async (
		_: unknown,
		{ userId }: { userId: string },
		context: AppQraphQLContext
	) => {
		const user: User = await isAuthenticatedMiddleware(context);
		return pubsub.subscribe(`ONLINE_STATUS_CHANGED_${userId}`);
	},
	resolve: (payload: boolean) => {
		return payload;
	},
};

/**
 * Publishes this user's current online/offline status to
 * `onlineStatusChanged` watchers.
 *
 * Online is published immediately: there's no flap risk to guard against,
 * and watchers should see "online" as soon as it's true. Offline is
 * debounced by `PRESENCE_OFFLINE_GRACE_MS`: a brief disconnect (network
 * blip, or the client's ~25-minute token-refresh reconnect) would otherwise
 * make presence flicker offline->online for anyone watching. Rather than
 * publishing `false` right away, we arm a per-user timer; the online path
 * above cancels it on reconnect, so `false` is never published for a brief
 * drop. When the timer does fire, `isUserOnline` is re-read at that moment
 * (not the value captured when the timer was armed) so a reconnect that
 * raced past the cancellation window still can't result in a stale `false`
 * being published after the user is already back online.
 */
export const publishOnlineStatusChanged = async ({
	userId,
}: {
	userId: types.Uuid;
}) => {
	const key = userId.toString();
	const isOnline = await userActiveSessionsService.isUserOnline(userId);

	if (isOnline) {
		clearPendingOfflinePublish(key);
		pubsub.publish(`ONLINE_STATUS_CHANGED_${key}`, true);
		return;
	}

	// Latest disconnect wins: clear any previously-armed timer before
	// arming a fresh one for this disconnect.
	clearPendingOfflinePublish(key);
	const timer = setTimeout(() => {
		(async () => {
			try {
				const stillOffline = !(await userActiveSessionsService.isUserOnline(userId));
				if (stillOffline) {
					pubsub.publish(`ONLINE_STATUS_CHANGED_${key}`, false);
				}
			} catch (error) {
				console.error(`Failed to publish debounced offline status for user ${key}:`, error);
			} finally {
				pendingOfflinePublishTimers.delete(key);
			}
		})();
	}, getPresenceOfflineGraceMs());
	pendingOfflinePublishTimers.set(key, timer);
};




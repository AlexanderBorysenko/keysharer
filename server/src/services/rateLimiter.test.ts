import { describe, expect, it } from "bun:test";
import { assertNotRateLimited, clearFailures, recordFailure } from "./rateLimiter";

const getGraphQLErrorCode = (error: unknown): string | undefined => {
	return (error as any)?.extensions?.code;
};

describe("rateLimiter", () => {
	it("allows up to `max` failures then throws a 429 on the next attempt", () => {
		const key = `test-${Math.random()}`;
		const max = 3;
		const windowMs = 60_000;

		// First `max` failures should not throw.
		for (let i = 0; i < max; i++) {
			expect(() => assertNotRateLimited(key, max, windowMs)).not.toThrow();
			recordFailure(key, windowMs);
		}

		// The (max + 1)th check should be rate limited.
		let thrown: unknown;
		try {
			assertNotRateLimited(key, max, windowMs);
		} catch (error) {
			thrown = error;
		}

		expect(thrown).toBeDefined();
		expect(getGraphQLErrorCode(thrown)).toBe("429");
	});

	it("resets the count after clearFailures", () => {
		const key = `test-${Math.random()}`;
		const max = 2;
		const windowMs = 60_000;

		recordFailure(key, windowMs);
		recordFailure(key, windowMs);

		expect(() => assertNotRateLimited(key, max, windowMs)).toThrow();

		clearFailures(key);

		expect(() => assertNotRateLimited(key, max, windowMs)).not.toThrow();
	});

	it("prunes entries older than windowMs", async () => {
		const key = `test-${Math.random()}`;
		const max = 1;
		const windowMs = 50; // tiny window, short real sleep below

		recordFailure(key, windowMs);

		// Immediately: the single failure is still within the window.
		expect(() => assertNotRateLimited(key, max, windowMs)).toThrow();

		// Wait past the window so the old timestamp is pruned.
		await new Promise((resolve) => setTimeout(resolve, windowMs + 25));

		expect(() => assertNotRateLimited(key, max, windowMs)).not.toThrow();
	});
});

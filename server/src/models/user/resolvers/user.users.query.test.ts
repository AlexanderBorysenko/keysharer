import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { GraphQLError } from "graphql";

// Mock the DB client and the auth middleware *before* importing the module
// under test, so the real `../../../db/client` (which opens a live Cassandra
// connection as an import side effect) is never loaded. This keeps the test
// fully offline.
const executeMock = mock(
	async (_query: string, _params: any[], _options: any) => ({ rows: [] as any[] })
);

let authShouldReject = false;
const authMock = mock(async () => {
	if (authShouldReject) {
		throw new GraphQLError("User not authenticated", {
			extensions: { code: "401", error: "UNAUTHENTICATED" },
		});
	}
	return { id: fakeUserId };
});

mock.module("../../../db/client", () => ({
	client: { execute: executeMock },
}));

mock.module("../middleware/isAuthenticatedMiddleware", () => ({
	isAuthenticatedMiddleware: authMock,
}));

const fakeUserId = "11111111-1111-1111-1111-111111111111";

const { usersQuery } = await import("./user.users.query");

describe("usersQuery (auth gate — H5 regression)", () => {
	beforeEach(() => {
		executeMock.mockClear();
		authMock.mockClear();
		authShouldReject = false;
	});

	afterEach(() => {
		executeMock.mockClear();
		authMock.mockClear();
		authShouldReject = false;
	});

	it("calls the auth middleware even when no `search` is given (no-search branch is no longer unauthenticated)", async () => {
		await usersQuery({}, { input: {} } as any, {} as any);

		expect(authMock).toHaveBeenCalledTimes(1);
		expect(executeMock).toHaveBeenCalledTimes(1);
	});

	it("rejects and never touches the DB when unauthenticated, with no `search` (the H5 bypass)", async () => {
		authShouldReject = true;

		await expect(
			usersQuery({}, { input: {} } as any, {} as any)
		).rejects.toThrow("User not authenticated");

		expect(executeMock).not.toHaveBeenCalled();
	});

	it("rejects and never touches the DB when unauthenticated, with `search` given", async () => {
		authShouldReject = true;

		await expect(
			usersQuery({}, { input: { search: "alice" } } as any, {} as any)
		).rejects.toThrow("User not authenticated");

		expect(executeMock).not.toHaveBeenCalled();
	});

	it("calls the auth middleware exactly once (not twice) on the search branch", async () => {
		await usersQuery({}, { input: { search: "alice" } } as any, {} as any);

		expect(authMock).toHaveBeenCalledTimes(1);
		expect(executeMock).toHaveBeenCalledTimes(1);
	});
});

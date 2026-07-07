import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { types } from "cassandra-driver";

// Mock the DB client and middleware *before* importing the module under test
// so the real `../../../db/client` (which opens a live Cassandra connection
// as an import side effect) and its transitive DB-touching dependencies are
// never loaded. This keeps the test fully offline.
const executeMock = mock(async () => ({ rows: [] }));

mock.module("../../../db/client", () => ({
    client: { execute: executeMock },
}));

mock.module("../../user/middleware/isAuthenticatedMiddleware", () => ({
    isAuthenticatedMiddleware: async () => ({ id: fakeUserId }),
}));

mock.module("../service/isUserAChatMemeber", () => ({
    isUserAChatMemberMiddleware: async () => {},
}));

const fakeUserId = types.Uuid.fromString("11111111-1111-1111-1111-111111111111");
const fakeChatId = types.Uuid.fromString("22222222-2222-2222-2222-222222222222");
const fakeLastMessageId = types.TimeUuid.fromString(
    "33333333-3333-1333-8333-333333333333"
);

const { chatMessages } = await import("./chat.Chat.messages.query");

describe("chatMessages (CQL parameterization)", () => {
    beforeEach(() => {
        executeMock.mockClear();
    });

    afterEach(() => {
        executeMock.mockClear();
    });

    it("binds chat_id and pageSize as params, with no lastMessageId", async () => {
        await chatMessages(
            { id: fakeChatId } as any,
            { lastMessageId: null },
            {} as any
        );

        expect(executeMock).toHaveBeenCalledTimes(1);
        const [query, params, options] = executeMock.mock.calls[0] as [
            string,
            any[],
            any
        ];

        // No interpolated values in the query text.
        expect(query).not.toContain("${");
        expect(query).not.toContain(fakeChatId.toString());
        expect(query.replace(/\s+/g, " ").trim()).toBe(
            "SELECT * FROM messages WHERE chat_id = ? LIMIT ?"
        );
        expect(params).toEqual([fakeChatId, 20]);
        expect(options).toEqual({ prepare: true });
    });

    it("binds chat_id, lastMessageId and pageSize as params, when lastMessageId is provided", async () => {
        await chatMessages(
            { id: fakeChatId } as any,
            { lastMessageId: fakeLastMessageId },
            {} as any
        );

        expect(executeMock).toHaveBeenCalledTimes(1);
        const [query, params, options] = executeMock.mock.calls[0] as [
            string,
            any[],
            any
        ];

        expect(query).not.toContain("${");
        expect(query).not.toContain(fakeChatId.toString());
        expect(query).not.toContain(fakeLastMessageId.toString());
        expect(query.replace(/\s+/g, " ").trim()).toBe(
            "SELECT * FROM messages WHERE chat_id = ? AND id < ? LIMIT ?"
        );
        expect(params).toEqual([fakeChatId, fakeLastMessageId, 20]);
        expect(options).toEqual({ prepare: true });
    });
});

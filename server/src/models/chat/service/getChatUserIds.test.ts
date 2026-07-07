import { beforeEach, describe, expect, it, mock } from "bun:test";
import { types } from "cassandra-driver";

// Mock the DB client *before* importing the module under test so the real
// `../../../db/client` (which opens a live Cassandra connection as an import
// side effect) is never loaded. This keeps the test fully offline, mirroring
// the pattern used in `chat.Chat.messages.query.test.ts`.
const fakeChatId = types.Uuid.fromString("22222222-2222-2222-2222-222222222222");
const userIdA = types.Uuid.fromString("11111111-1111-1111-1111-111111111111");
const userIdB = types.Uuid.fromString("33333333-3333-3333-3333-333333333333");
const userIdC = types.Uuid.fromString("44444444-4444-4444-4444-444444444444");

const executeMock = mock(async (_query: string, _params: any[], _options: any) => ({
    rows: [{ user_id: userIdA }, { user_id: userIdB }, { user_id: userIdC }],
}));

mock.module("../../../db/client", () => ({
    client: { execute: executeMock },
}));

const { getChatUserIds } = await import("./getChatUserIds");

describe("getChatUserIds (exclude filter)", () => {
    beforeEach(() => {
        executeMock.mockClear();
    });

    it("excludes the given user id and keeps the rest", async () => {
        const result = await getChatUserIds({ chatId: fakeChatId, exclude: [userIdB] });

        const resultStrings = result.map((id) => id.toString());
        expect(resultStrings).not.toContain(userIdB.toString());
        expect(resultStrings).toEqual(
            expect.arrayContaining([userIdA.toString(), userIdC.toString()])
        );
        expect(result).toHaveLength(2);
    });

    it("does not filter anything when exclude is empty", async () => {
        const result = await getChatUserIds({ chatId: fakeChatId, exclude: [] });

        expect(result).toHaveLength(3);
        expect(result.map((id) => id.toString())).toEqual(
            expect.arrayContaining([
                userIdA.toString(),
                userIdB.toString(),
                userIdC.toString(),
            ])
        );
    });

    it("does not filter anything when exclude is omitted", async () => {
        const result = await getChatUserIds({ chatId: fakeChatId });

        expect(result).toHaveLength(3);
    });
});

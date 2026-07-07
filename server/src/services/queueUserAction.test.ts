import { describe, expect, it } from "bun:test";
import queueUserAction from "./queueUserAction";

describe("queueUserAction", () => {
    it("does not let a rejected action break the chain for later queued actions", async () => {
        const calls: string[] = [];
        const userId = `user-${Math.random()}`;

        const first = queueUserAction(userId, async () => {
            calls.push("first");
            throw new Error("boom");
        });

        const second = queueUserAction(userId, async () => {
            calls.push("second");
        });

        const third = queueUserAction(userId, async () => {
            calls.push("third");
        });

        // None of the returned promises should reject / go unhandled.
        await first;
        await second;
        await third;

        expect(calls).toEqual(["first", "second", "third"]);
    });

    it("still serializes actions for the same user in arrival order", async () => {
        const order: number[] = [];
        const userId = `user-${Math.random()}`;

        await Promise.all([
            queueUserAction(userId, async () => {
                await new Promise((resolve) => setTimeout(resolve, 20));
                order.push(1);
            }),
            queueUserAction(userId, async () => {
                order.push(2);
            }),
            queueUserAction(userId, async () => {
                order.push(3);
            }),
        ]);

        expect(order).toEqual([1, 2, 3]);
    });

    it("does not cross-contaminate chains for different users", async () => {
        const calls: string[] = [];
        const userIdA = `user-a-${Math.random()}`;
        const userIdB = `user-b-${Math.random()}`;

        await queueUserAction(userIdA, async () => {
            calls.push("a-fail");
            throw new Error("boom");
        });

        await queueUserAction(userIdB, async () => {
            calls.push("b-ok");
        });

        expect(calls).toEqual(["a-fail", "b-ok"]);
    });
});

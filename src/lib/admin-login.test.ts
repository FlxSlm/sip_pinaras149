import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@/generated/prisma/client";
import { nextLoginState, verifyAdminLogin } from "@/lib/admin-login";
import { hashPassword } from "@/lib/password";

const now = Date.UTC(2026, 9, 14);
const hash = hashPassword("synthetic-admin-password");
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(now); });
afterEach(() => vi.useRealTimers());
function database() {
    const states = new Map<string, { failedAttempts: number; blockedUntil: Date | null }>();
    const update = vi.fn(async ({ where, data }) => { states.set(where.userId, data); });
    const tx = { adminLoginThrottle: { update }, $executeRaw: async (query: { values: string[] }) => { const id = query.values[0]; if (!states.has(id)) states.set(id, { failedAttempts: 0, blockedUntil: null }); }, $queryRaw: async (query: { values: string[] }) => [states.get(query.values[0])] };
    return { db: { $transaction: async (action: (tx: unknown) => unknown) => action(tx) } as unknown as PrismaClient, states, update };
}
describe("persistent admin login cooldown", () => {
    it("locks on the fifth failure, ignores blocked requests, then escalates 1/3/9 minutes", async () => {
        const { db, states, update } = database();
        for (let i = 0; i < 4; i++) expect(await verifyAdminLogin(db, "admin", "incorrect", hash)).toEqual({ accepted: false, blockedUntil: null, attemptsRemaining: 4 - i });
        expect((await verifyAdminLogin(db, "admin", "incorrect", hash)).blockedUntil?.getTime()).toBe(now + 60000);
        const writes = update.mock.calls.length;
        expect((await verifyAdminLogin(db, "admin", "synthetic-admin-password", hash)).accepted).toBe(false);
        expect(update.mock.calls.length).toBe(writes);
        expect(states.get("admin")?.failedAttempts).toBe(5);
        vi.setSystemTime(now + 60000);
        expect((await verifyAdminLogin(db, "admin", "incorrect", hash)).blockedUntil?.getTime()).toBe(now + 240000);
        vi.setSystemTime(now + 240000);
        expect((await verifyAdminLogin(db, "admin", "incorrect", hash)).blockedUntil?.getTime()).toBe(now + 780000);
        vi.setSystemTime(now + 780000);
        expect((await verifyAdminLogin(db, "admin", "synthetic-admin-password", hash)).accepted).toBe(true);
        expect(states.get("admin")).toEqual({ failedAttempts: 0, blockedUntil: null });
    });
    it("does not share counters between accounts", async () => {
        const { db, states } = database();
        await verifyAdminLogin(db, "one", "incorrect", hash);
        await verifyAdminLogin(db, "two", "synthetic-admin-password", hash);
        expect(states.get("one")?.failedAttempts).toBe(1);
        expect(states.get("two")?.failedAttempts).toBe(0);
    });
    it("saturates safely without an invalid date on extreme counters", () => {
        expect(Number.isFinite(nextLoginState(100000, now).blockedUntil!.getTime())).toBe(true);
    });
});

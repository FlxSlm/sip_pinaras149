import { beforeEach, describe, expect, it, vi } from "vitest";
import { authOptions } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

const { findUnique } = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { user: { findUnique } } }));
const signIn = authOptions.callbacks!.signIn as unknown as (params: unknown) => Promise<boolean>;
const jwt = authOptions.callbacks!.jwt as unknown as (params: unknown) => Promise<Record<string, unknown>>;
const session = authOptions.callbacks!.session as unknown as (params: unknown) => Promise<{ user: { id: string; role: string } }>;
const credentials = authOptions.providers.find((p) => p.id === "credentials")!;
const authorize = (credentials as unknown as { options: { authorize: (params: unknown) => Promise<unknown> } }).options.authorize;
const admin = { id: "admin-test", name: "Admin", email: null, role: "ADMIN_KELURAHAN", passwordHash: hashPassword("test-password") };
beforeEach(() => { findUnique.mockReset(); });

describe("authentication methods", () => {
    it.each(["WARGA", undefined])("Google warga diizinkan dengan role %s", async (role) => {
        expect(await signIn({ user: { id: "warga", role }, account: { type: "oauth", provider: "google" } })).toBe(true);
    });
    it("admin Google, provider lain, dan credentials warga ditolak", async () => {
        expect(await signIn({ user: admin, account: { type: "oauth", provider: "google" } })).toBe(false);
        expect(await signIn({ user: { role: "WARGA" }, account: { type: "oauth", provider: "facebook" } })).toBe(false);
        expect(await signIn({ user: { role: "WARGA" }, account: { type: "credentials" } })).toBe(false);
        expect(await signIn({ user: admin, account: { type: "credentials" } })).toBe(true);
    });
});

describe("admin authorize", () => {
    it("normalisasi username, password benar, tanpa membocorkan hash", async () => {
        findUnique.mockResolvedValue(admin);
        expect(await authorize({ username: " ADMIN.PINARAS ", password: "test-password" })).toEqual({ id: admin.id, name: admin.name, email: null, role: admin.role });
        expect(findUnique.mock.calls[0][0].where).toEqual({ username: "admin.pinaras" });
    });
    it.each([null, { ...admin, role: "WARGA" }, { ...admin, passwordHash: null }, { ...admin, passwordHash: "scrypt:salt:zz" }])("menolak akun/hash tidak valid", async (user) => {
        findUnique.mockResolvedValue(user);
        expect(await authorize({ username: "admin.pinaras", password: "test-password" })).toBeNull();
    });
    it("password salah atau ditambah spasi ditolak", async () => {
        findUnique.mockResolvedValue(admin);
        expect(await authorize({ username: "admin.pinaras", password: "wrong-password" })).toBeNull();
        expect(await authorize({ username: "admin.pinaras", password: "test-password " })).toBeNull();
    });
    it("input kosong ditolak sebelum query", async () => {
        expect(await authorize({})).toBeNull();
        expect(findUnique).not.toHaveBeenCalled();
    });
    it("error database tidak diteruskan ke URL login", async () => {
        findUnique.mockImplementation(async () => { throw new Error("private database details"); });
        let message = "no-error";
        try { await authorize({ username: "admin.pinaras", password: "test-password" }); }
        catch (error) { message = error instanceof Error ? error.message : "unknown"; }
        expect(message).toBe("Configuration");
    });
});

describe("JWT dan session", () => {
    it.each(["WARGA", "ADMIN_KELURAHAN"])("ID dan role %s bertahan setelah callback dan refresh", async (role) => {
        const token = await jwt({ token: {}, user: { id: "persisted-id", role } });
        expect(await jwt({ token })).toEqual({ userId: "persisted-id", role });
        expect((await session({ session: { user: {} }, token })).user).toEqual({ id: "persisted-id", role });
    });
    it("user adapter tanpa role dicocokkan dengan data tersimpan", async () => {
        findUnique.mockResolvedValue({ id: "persisted-id", role: "WARGA" });
        expect(await jwt({ token: {}, user: { id: "persisted-id" } })).toEqual({ userId: "persisted-id", role: "WARGA" });
        expect(findUnique.mock.calls[0][0].where).toEqual({ id: "persisted-id" });
    });
    it("role/identitas tidak lengkap tidak diberi role default", async () => {
        findUnique.mockResolvedValue(null);
        await expect(jwt({ token: {}, user: { id: "missing" } })).rejects.toThrow("SessionRequired");
        for (const token of [{}, { userId: "id", role: "PETUGAS" }, { role: "WARGA" }]) {
            await expect(jwt({ token })).rejects.toThrow("SessionRequired");
            await expect(session({ session: { user: {} }, token })).rejects.toThrow("SessionRequired");
        }
    });
});

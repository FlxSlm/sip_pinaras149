import { describe, expect, it } from "vitest";
import { authOptions } from "@/lib/auth";

describe("authOptions providers", () => {
    it("menyediakan provider credentials untuk Admin Kelurahan", () => {
        const credentials = authOptions.providers.find((provider) => provider.id === "credentials");
        expect(credentials?.type).toBe("credentials");
    });

    it("tidak menyediakan Facebook OAuth", () => {
        const ids = authOptions.providers.map((provider) => provider.id);
        expect(ids).not.toContain("facebook");
    });
});

describe("authOptions.signIn callback", () => {
    const signIn = authOptions.callbacks?.signIn as unknown as (params: unknown) => Promise<boolean>;

    it("WARGA boleh login via Google OAuth", async () => {
        expect(await signIn({ user: { id: "u1", role: "WARGA" }, account: { type: "oauth", provider: "google" } })).toBe(true);
    });

    it("ADMIN_KELURAHAN tidak boleh login via Google OAuth", async () => {
        expect(await signIn({ user: { id: "u1", role: "ADMIN_KELURAHAN" }, account: { type: "oauth" } })).toBe(false);
    });

    it("credentials (admin) diizinkan ( sudah diverifikasi authorize )", async () => {
        expect(await signIn({ user: { id: "u1", role: "ADMIN_KELURAHAN" }, account: { type: "credentials" } })).toBe(true);
    });
});

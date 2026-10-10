import { describe, expect, it } from "vitest";
import { getAuthErrorMessage } from "./auth-errors";
import { hashPassword, verifyPassword } from "./password";

describe("safe authentication errors", () => {
    it("OAuth batal/gagal mendapat pesan dan tanpa query error tidak ada alert", () => {
        expect(getAuthErrorMessage("OAuthCallback")).toContain("dibatalkan");
        expect(getAuthErrorMessage("OAuthSignin")).toContain("Google");
        expect(getAuthErrorMessage(undefined)).toBe("");
    });
    it.each(["private-error", "constructor", "__proto__", "toString"])("kode tidak dikenal %s menjadi pesan aman", (code) => {
        const message = getAuthErrorMessage(code);
        expect(typeof message).toBe("string");
        expect(message).toContain("Login tidak berhasil");
        expect(message).not.toContain(code);
    });
});
describe("password hash integrity", () => {
    it("password benar diterima dan hash terpotong ditolak", () => {
        const hash = hashPassword("test-password");
        expect(verifyPassword("test-password", hash)).toBe(true);
        expect(verifyPassword("wrong-password", hash)).toBe(false);
        expect(verifyPassword("test-password", hash.slice(0, -2))).toBe(false);
        expect(verifyPassword("anything", "scrypt:" + "a".repeat(32) + ":zz")).toBe(false);
    });
});

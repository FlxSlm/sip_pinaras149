import { describe, expect, it } from "vitest";
import { getRoleHome, getLoginDestination, getAuthRedirectUrl } from "@/lib/authorization";

describe("getRoleHome", () => {
    it("mengarahkan warga ke /warga", () => {
        expect(getRoleHome("WARGA")).toBe("/warga");
    });

    it("mengarahkan admin kelurahan ke /admin", () => {
        expect(getRoleHome("ADMIN_KELURAHAN")).toBe("/admin");
    });

    it("meminta login untuk role tidak dikenal", () => {
        expect(getRoleHome(undefined)).toBe("/login");
    });
});

describe("callback destinations", () => {
    it.each(["/login", "/admin", "//evil.example/warga", "https://evil.example/warga", "/warga/../../admin", "/warga/%5cevil", "/warga-evil", "javascript:alert(1)"])("menolak tujuan warga %s", (path) => {
        expect(getLoginDestination("WARGA", path)).toBe("/warga");
    });
    it("mempertahankan halaman milik role dan query", () => {
        expect(getLoginDestination("WARGA", "/warga/pengaduan?status=MENUNGGU")).toBe("/warga/pengaduan?status=MENUNGGU");
        expect(getLoginDestination("ADMIN_KELURAHAN", "/admin/pengaduan")).toBe("/admin/pengaduan");
        expect(getLoginDestination("ADMIN_KELURAHAN", "/warga")).toBe("/admin");
    });
    it("redirect NextAuth menerima same-origin dan logout ke publik", () => {
        expect(getAuthRedirectUrl("https://sipp.example/admin", "https://sipp.example")).toBe("https://sipp.example/admin");
        expect(getAuthRedirectUrl("/", "https://sipp.example")).toBe("https://sipp.example/");
        expect(getAuthRedirectUrl("/login", "https://sipp.example")).toBe("https://sipp.example/warga");
        expect(getAuthRedirectUrl("https://evil.example/", "https://sipp.example")).toBe("https://sipp.example/warga");
    });
});

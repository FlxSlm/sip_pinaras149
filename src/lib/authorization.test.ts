import { describe, expect, it } from "vitest";
import { getRoleHome } from "@/lib/authorization";

describe("getRoleHome", () => {
    it("mengarahkan warga ke /warga", () => {
        expect(getRoleHome("warga")).toBe("/warga");
    });

    it("mengarahkan lurah ke /petugas/lurah", () => {
        expect(getRoleHome("lurah")).toBe("/petugas/lurah");
    });

    it("mengarahkan kepala lingkungan ke /petugas/lingkungan", () => {
        expect(getRoleHome("kepala_lingkungan")).toBe("/petugas/lingkungan");
    });

    it("fallback ke /warga untuk role tidak dikenal", () => {
        expect(getRoleHome(undefined)).toBe("/warga");
    });
});

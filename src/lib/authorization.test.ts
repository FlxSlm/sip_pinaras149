import { describe, expect, it } from "vitest";
import { getRoleHome } from "@/lib/authorization";

describe("getRoleHome", () => {
    it("mengarahkan warga ke /warga", () => {
        expect(getRoleHome("WARGA")).toBe("/warga");
    });

    it("mengarahkan admin kelurahan ke /admin", () => {
        expect(getRoleHome("ADMIN_KELURAHAN")).toBe("/admin");
    });

    it("fallback ke /warga untuk role tidak dikenal", () => {
        expect(getRoleHome(undefined)).toBe("/warga");
    });
});

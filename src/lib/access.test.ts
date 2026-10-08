import { describe, expect, it } from "vitest";
import { canAccessComplaint } from "@/lib/access";

const complaint = { reporterUserId: "warga-a" };

describe("canAccessComplaint", () => {
    it("ADMIN_KELURAHAN dapat mengakses seluruh complaint", () => {
        expect(canAccessComplaint({ id: "admin-1", role: "ADMIN_KELURAHAN" }, complaint)).toBe(true);
    });

    it("WARGA pemilik dapat mengakses complaint-nya", () => {
        expect(canAccessComplaint({ id: "warga-a", role: "WARGA" }, complaint)).toBe(true);
    });

    it("WARGA lain tidak dapat mengakses complaint milik orang lain", () => {
        expect(canAccessComplaint({ id: "warga-b", role: "WARGA" }, complaint)).toBe(false);
    });
});

import { describe, expect, it } from "vitest";
import { complaintInputSchema, formatTicketNumber, periodKey } from "@/lib/complaints";

describe("complaintInputSchema", () => {
    const valid = {
        lingkunganId: "lingkungan-1",
        title: "Jalan rusak",
        category: "Infrastruktur",
        description: "Jalan berlubang di depan gang.",
    };

    it("menerima input valid", () => {
        const result = complaintInputSchema.safeParse(valid);
        expect(result.success).toBe(true);
    });

    it("menolak lingkunganId kosong", () => {
        const result = complaintInputSchema.safeParse({ ...valid, lingkunganId: "  " });
        expect(result.success).toBe(false);
    });

    it("menolak judul kurang dari 5 karakter", () => {
        const result = complaintInputSchema.safeParse({ ...valid, title: "Jal" });
        expect(result.success).toBe(false);
    });

    it("menolak kategori kosong", () => {
        const result = complaintInputSchema.safeParse({ ...valid, category: "" });
        expect(result.success).toBe(false);
    });

    it("menolak deskripsi kosong", () => {
        const result = complaintInputSchema.safeParse({ ...valid, description: "   " });
        expect(result.success).toBe(false);
    });
});

describe("periodKey", () => {
    it("memformat tahun dan bulan (UTC) menjadi YYYYMM", () => {
        expect(periodKey(new Date(Date.UTC(2026, 8, 15)))).toBe("202609");
        expect(periodKey(new Date(Date.UTC(2026, 0, 1)))).toBe("202601");
        expect(periodKey(new Date(Date.UTC(2025, 11, 31)))).toBe("202512");
    });
});

describe("formatTicketNumber", () => {
    it("memformat sesuai pola LPR-YYYYMM-###", () => {
        expect(formatTicketNumber("202609", 1)).toBe("LPR-202609-001");
        expect(formatTicketNumber("202609", 42)).toBe("LPR-202609-042");
    });

    it("menambahkan leading zero menjadi 3 digit", () => {
        expect(formatTicketNumber("202609", 7)).toBe("LPR-202609-007");
    });

    it("tidak memotong urutan di atas 999", () => {
        expect(formatTicketNumber("202609", 1000)).toBe("LPR-202609-1000");
    });
});

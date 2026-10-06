import { describe, expect, it } from "vitest";
import { complaintInputSchema, formatTicketNumber, periodKey } from "@/lib/complaints";

describe("complaintInputSchema", () => {
    const valid = {
        title: "Jalan rusak",
        category: "Infrastruktur",
        description: "Jalan berlubang di depan gang.",
        location: "Jl. Melati",
    };

    it("menerima input valid", () => {
        expect(complaintInputSchema.safeParse(valid).success).toBe(true);
    });

    it("menerima input tanpa lokasi", () => {
        const withoutLocation = { title: valid.title, category: valid.category, description: valid.description };
        expect(complaintInputSchema.safeParse(withoutLocation).success).toBe(true);
    });

    it("menolak judul kurang dari 5 karakter", () => {
        expect(complaintInputSchema.safeParse({ ...valid, title: "Jal" }).success).toBe(false);
    });

    it("menolak kategori kosong", () => {
        expect(complaintInputSchema.safeParse({ ...valid, category: "" }).success).toBe(false);
    });

    it("menolak deskripsi kosong", () => {
        expect(complaintInputSchema.safeParse({ ...valid, description: "   " }).success).toBe(false);
    });
});

describe("periodKey", () => {
    it("memformat tahun dan bulan (UTC) menjadi YYYYMM", () => {
        expect(periodKey(new Date(Date.UTC(2026, 8, 15)))).toBe("202609");
        expect(periodKey(new Date(Date.UTC(2026, 0, 1)))).toBe("202601");
    });
});

describe("formatTicketNumber", () => {
    it("memformat sesuai pola LPR-YYYYMM-###", () => {
        expect(formatTicketNumber("202609", 1)).toBe("LPR-202609-001");
        expect(formatTicketNumber("202609", 42)).toBe("LPR-202609-042");
        expect(formatTicketNumber("202609", 1000)).toBe("LPR-202609-1000");
    });
});

import { describe, expect, it } from "vitest";
import { redactPII, toPublicComplaint } from "@/lib/complaint-projection";

describe("redactPII", () => {
    it("menyembunyikan email", () => {
        expect(redactPII("Hubungi saya di budi@example.com ya")).toContain("[email disembunyikan]");
    });

    it("menyembunyikan nomor telepon", () => {
        expect(redactPII("WA saya 081234567890")).toContain("[telepon disembunyikan]");
    });

    it("membiarkan teks biasa", () => {
        expect(redactPII("Jalan rusak di depan gang")).toBe("Jalan rusak di depan gang");
    });
});

describe("toPublicComplaint", () => {
    it("hanya menghasilkan field publik dan tersanitasi", () => {
        const result = toPublicComplaint({
            ticketNumber: "LPR-202610-001",
            title: "Jalan rusak",
            category: "Infrastruktur",
            description: "Hubungi 081234567890",
            status: "SELESAI",
            priority: "NORMAL",
            createdAt: new Date("2026-10-01T00:00:00.000Z"),
            completedAt: new Date("2026-10-05T00:00:00.000Z"),
            rejectedAt: null,
            officialResponse: "Sudah diperbaiki, info ke budi@example.com",
        });

        expect(result).not.toHaveProperty("reporterUserId");
        expect(result.description).toContain("[telepon disembunyikan]");
        expect(result.officialResponse).toContain("[email disembunyikan]");
        expect(result.status).toBe("SELESAI");
    });
});

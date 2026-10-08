import { describe, expect, it } from "vitest";
import { redactPII, toPublicComplaint, isPublicComplaintStatus, PUBLIC_COMPLAINT_STATUSES } from "@/lib/complaint-projection";

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

describe("public complaint visibility", () => {
    it("hanya SELESAI dan DITOLAK yang publik", () => {
        expect(isPublicComplaintStatus("SELESAI")).toBe(true);
        expect(isPublicComplaintStatus("DITOLAK")).toBe(true);
        expect(isPublicComplaintStatus("MENUNGGU")).toBe(false);
        expect(isPublicComplaintStatus("DIPROSES")).toBe(false);
    });

    it("konstanta status publik tepat SELESAI/DITOLAK", () => {
        expect([...PUBLIC_COMPLAINT_STATUSES]).toEqual(["SELESAI", "DITOLAK"]);
    });
});

describe("toPublicComplaint", () => {
    const input = {
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
    };

    it("hanya menghasilkan field publik yang aman", () => {
        const result = toPublicComplaint(input);
        expect(Object.keys(result).sort()).toEqual([
            "category",
            "completedAt",
            "createdAt",
            "description",
            "officialResponse",
            "priority",
            "rejectedAt",
            "status",
            "ticketNumber",
            "title",
        ]);
        expect(result).not.toHaveProperty("reporterUserId");
        expect(result).not.toHaveProperty("internalNote");
        expect(result).not.toHaveProperty("evidences");
    });

    it("meredaksi PII pada deskripsi dan tanggapan", () => {
        const result = toPublicComplaint(input);
        expect(result.description).toContain("[telepon disembunyikan]");
        expect(result.officialResponse).toContain("[email disembunyikan]");
        expect(result.status).toBe("SELESAI");
    });
});

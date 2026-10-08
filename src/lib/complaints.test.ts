import { describe, expect, it } from "vitest";
import type { PrismaClient } from "@/generated/prisma/client";
import { complaintInputSchema, createComplaint, formatTicketNumber, periodKey } from "@/lib/complaints";

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

function makePrisma() {
    const created: Array<{ data: Record<string, unknown> }> = [];
    const evidence: Array<Array<Record<string, unknown>>> = [];
    const notifications: Array<Array<Record<string, unknown>>> = [];

    const transaction = {
        ticketSequence: { upsert: async () => ({ currentValue: 7 }) },
        complaint: {
            create: async (args: { data: Record<string, unknown> }) => {
                created.push(args);
                return { id: "c1", ticketNumber: args.data.ticketNumber as string };
            },
        },
        complaintEvidence: {
            createMany: async (args: { data: Array<Record<string, unknown>> }) => {
                evidence.push(args.data);
                return { count: args.data.length };
            },
        },
        user: { findMany: async () => [{ id: "admin1" }, { id: "admin2" }] },
        notification: {
            createMany: async (args: { data: Array<Record<string, unknown>> }) => {
                notifications.push(args.data);
                return { count: args.data.length };
            },
        },
    };

    const prisma = {
        $transaction: async (callback: (tx: typeof transaction) => Promise<unknown>) => callback(transaction),
    } as unknown as PrismaClient;

    return { prisma, created, evidence, notifications };
}

describe("createComplaint", () => {
    const input = { title: "Jalan rusak", category: "Infrastruktur", description: "Berlubang di depan gang." };

    it("menyimpan sebagai MENUNGGU dengan tiket unik berurutan", async () => {
        const { prisma, created } = makePrisma();
        const result = await createComplaint(prisma, input, "warga1", []);
        expect(result.ticketNumber).toMatch(/^LPR-\d{6}-007$/);
        expect(created[0].data.status).toBe("MENUNGGU");
        expect(created[0].data.reporterUserId).toBe("warga1");
    });

    it("membuat notifikasi untuk setiap ADMIN_KELURAHAN", async () => {
        const { prisma, notifications } = makePrisma();
        await createComplaint(prisma, input, "warga1", []);
        expect(notifications[0]).toHaveLength(2);
        expect(notifications[0][0].type).toBe("COMPLAINT_RECEIVED");
        expect(notifications[0][0].recipientId).toBe("admin1");
    });

    it("menyimpan bukti bila ada", async () => {
        const { prisma, evidence } = makePrisma();
        await createComplaint(prisma, input, "warga1", [{ path: "storage/evidence/a.png", mimeType: "image/png", sizeBytes: 10 }]);
        expect(evidence[0]).toHaveLength(1);
        expect(evidence[0][0]).toMatchObject({ complaintId: "c1", path: "storage/evidence/a.png", mimeType: "image/png" });
    });
});

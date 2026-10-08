import { describe, expect, it } from "vitest";
import type { PrismaClient } from "@/generated/prisma/client";
import { applyAdminAction } from "@/lib/admin-workflow";

type ComplaintRow = {
    id: string;
    status: string;
    priority: string | null;
    reporterUserId: string;
    ticketNumber: string;
};

function makePrisma(complaint: ComplaintRow | null) {
    const updates: Array<{ data: Record<string, unknown> }> = [];
    const logs: Array<{ data: Record<string, unknown> }> = [];
    const notifications: Array<{ data: Record<string, unknown> }> = [];

    const transaction = {
        complaint: {
            findUnique: async () => complaint,
            update: async (args: { data: Record<string, unknown> }) => {
                updates.push(args);
                return {};
            },
        },
        complaintLog: {
            create: async (args: { data: Record<string, unknown> }) => {
                logs.push(args);
                return {};
            },
        },
        notification: {
            create: async (args: { data: Record<string, unknown> }) => {
                notifications.push(args);
                return {};
            },
        },
    };

    const prisma = {
        $transaction: async (callback: (tx: typeof transaction) => Promise<unknown>) => callback(transaction),
    } as unknown as PrismaClient;

    return { prisma, updates, logs, notifications };
}

const base: ComplaintRow = {
    id: "c1",
    status: "MENUNGGU",
    priority: null,
    reporterUserId: "warga1",
    ticketNumber: "LPR-202610-001",
};

describe("applyAdminAction — transisi status", () => {
    it("OPEN dari MENUNGGU wajib priority, set DIPROSES + log + notifikasi warga", async () => {
        const { prisma, updates, logs, notifications } = makePrisma({ ...base });
        await applyAdminAction(prisma, { complaintId: "c1", action: "OPEN", priority: "PERLU_PERHATIAN" }, "admin1");
        expect(updates[0].data).toMatchObject({ status: "DIPROSES", priority: "PERLU_PERHATIAN" });
        expect(logs.map((l) => l.data.action)).toEqual(expect.arrayContaining(["STATUS_CHANGED", "PRIORITY_CHANGED"]));
        expect(notifications[0].data.recipientId).toBe("warga1");
    });

    it("OPEN tanpa priority ditolak (PRIORITY_REQUIRED)", async () => {
        const { prisma } = makePrisma({ ...base });
        await expect(applyAdminAction(prisma, { complaintId: "c1", action: "OPEN" }, "admin1")).rejects.toThrow("PRIORITY_REQUIRED");
    });

    it("OPEN dari DIPROSES ditolak (INVALID_TRANSITION)", async () => {
        const { prisma } = makePrisma({ ...base, status: "DIPROSES" });
        await expect(applyAdminAction(prisma, { complaintId: "c1", action: "OPEN", priority: "NORMAL" }, "admin1")).rejects.toThrow("INVALID_TRANSITION");
    });

    it("COMPLETE dari DIPROSES -> SELESAI", async () => {
        const { prisma, updates, notifications } = makePrisma({ ...base, status: "DIPROSES" });
        await applyAdminAction(prisma, { complaintId: "c1", action: "COMPLETE" }, "admin1");
        expect(updates[0].data.status).toBe("SELESAI");
        expect(notifications[0].data.recipientId).toBe("warga1");
    });

    it("COMPLETE dari MENUNGGU -> SELESAI", async () => {
        const { prisma, updates } = makePrisma({ ...base, status: "MENUNGGU" });
        await applyAdminAction(prisma, { complaintId: "c1", action: "COMPLETE" }, "admin1");
        expect(updates[0].data.status).toBe("SELESAI");
    });

    it("COMPLETE dari SELESAI ditolak", async () => {
        const { prisma } = makePrisma({ ...base, status: "SELESAI" });
        await expect(applyAdminAction(prisma, { complaintId: "c1", action: "COMPLETE" }, "admin1")).rejects.toThrow("INVALID_TRANSITION");
    });

    it("REJECT dari MENUNGGU dengan note -> DITOLAK", async () => {
        const { prisma, updates, logs } = makePrisma({ ...base, status: "MENUNGGU" });
        await applyAdminAction(prisma, { complaintId: "c1", action: "REJECT", note: "Di luar kewenangan" }, "admin1");
        expect(updates[0].data.status).toBe("DITOLAK");
        expect(logs.some((l) => l.data.action === "STATUS_CHANGED")).toBe(true);
    });

    it("REJECT dari DIPROSES ditolak (hanya MENUNGGU->DITOLAK)", async () => {
        const { prisma } = makePrisma({ ...base, status: "DIPROSES" });
        await expect(applyAdminAction(prisma, { complaintId: "c1", action: "REJECT", note: "x" }, "admin1")).rejects.toThrow("INVALID_TRANSITION");
    });

    it("REJECT tanpa note ditolak (NOTE_REQUIRED)", async () => {
        const { prisma } = makePrisma({ ...base, status: "MENUNGGU" });
        await expect(applyAdminAction(prisma, { complaintId: "c1", action: "REJECT" }, "admin1")).rejects.toThrow("NOTE_REQUIRED");
    });

    it("RESPOND tanpa note ditolak", async () => {
        const { prisma } = makePrisma({ ...base, status: "DIPROSES" });
        await expect(applyAdminAction(prisma, { complaintId: "c1", action: "RESPOND" }, "admin1")).rejects.toThrow("NOTE_REQUIRED");
    });

    it("RESPOND dengan note -> log RESPONSE_ADDED + notifikasi warga", async () => {
        const { prisma, logs, notifications } = makePrisma({ ...base, status: "DIPROSES" });
        await applyAdminAction(prisma, { complaintId: "c1", action: "RESPOND", note: "Sedang ditangani" }, "admin1");
        expect(logs[0].data.action).toBe("RESPONSE_ADDED");
        expect(notifications[0].data.type).toBe("COMPLAINT_UPDATED");
        expect(notifications[0].data.recipientId).toBe("warga1");
    });

    it("complaint tidak ditemukan -> COMPLAINT_NOT_FOUND", async () => {
        const { prisma } = makePrisma(null);
        await expect(applyAdminAction(prisma, { complaintId: "x", action: "OPEN", priority: "NORMAL" }, "admin1")).rejects.toThrow("COMPLAINT_NOT_FOUND");
    });
});

describe("applyAdminAction — notifikasi selalu ke reporter", () => {
    it("recipientId adalah reporterUserId", async () => {
        const { prisma, notifications } = makePrisma({ ...base, status: "MENUNGGU", reporterUserId: "owner-99" });
        await applyAdminAction(prisma, { complaintId: "c1", action: "COMPLETE" }, "admin1");
        expect(notifications[0].data.recipientId).toBe("owner-99");
    });
});

import { z } from "zod";
import type { PrismaClient } from "@/generated/prisma/client";

export const adminActionSchema = z.object({
    complaintId: z.string().trim().min(1),
    action: z.enum(["OPEN", "COMPLETE", "REJECT", "RESPOND"]),
    priority: z.enum(["NORMAL", "PERLU_PERHATIAN"]).optional(),
    note: z.string().trim().max(5000, "Catatan maksimal 5.000 karakter.").optional(),
});

type AdminActionInput = z.infer<typeof adminActionSchema>;

export async function applyAdminAction(
    prisma: PrismaClient,
    input: AdminActionInput,
    actorUserId: string,
) {
    return prisma.$transaction(async (transaction) => {
        const complaint = await transaction.complaint.findUnique({
            where: { id: input.complaintId },
            select: { id: true, status: true, priority: true, reporterUserId: true, ticketNumber: true },
        });
        if (!complaint) throw new Error("COMPLAINT_NOT_FOUND");

        if (input.action === "RESPOND") {
            if (!input.note) throw new Error("NOTE_REQUIRED");
            await transaction.complaint.update({
                where: { id: complaint.id },
                data: { officialResponse: input.note, respondedAt: new Date() },
            });
            await transaction.complaintLog.create({
                data: { complaintId: complaint.id, actorUserId, action: "RESPONSE_ADDED", note: input.note },
            });
            await transaction.notification.create({
                data: {
                    recipientId: complaint.reporterUserId,
                    type: "COMPLAINT_UPDATED",
                    title: "Status pengaduan berubah",
                    message: `Pengaduan ${complaint.ticketNumber} mendapat tanggapan dari Admin Kelurahan.`,
                    complaintId: complaint.id,
                },
            });
            return { id: complaint.id };
        }

        if (input.action === "OPEN") {
            if (complaint.status !== "MENUNGGU") throw new Error("INVALID_TRANSITION");
            if (!input.priority) throw new Error("PRIORITY_REQUIRED");
            await transaction.complaint.update({
                where: { id: complaint.id },
                data: { status: "DIPROSES", priority: input.priority, openedAt: new Date() },
            });
            await transaction.complaintLog.create({
                data: { complaintId: complaint.id, actorUserId, action: "STATUS_CHANGED", fromStatus: "MENUNGGU", toStatus: "DIPROSES" },
            });
            await transaction.complaintLog.create({
                data: { complaintId: complaint.id, actorUserId, action: "PRIORITY_CHANGED", newPriority: input.priority },
            });
            if (input.note) {
                await transaction.complaintLog.create({ data: { complaintId: complaint.id, actorUserId, action: "NOTE_ADDED", note: input.note } });
            }
            await transaction.notification.create({
                data: {
                    recipientId: complaint.reporterUserId,
                    type: "COMPLAINT_UPDATED",
                    title: "Status pengaduan berubah",
                    message: `Pengaduan ${complaint.ticketNumber} mulai diproses.`,
                    complaintId: complaint.id,
                },
            });
            return { id: complaint.id };
        }

        if (input.action === "COMPLETE") {
            if (complaint.status !== "DIPROSES" && complaint.status !== "MENUNGGU") throw new Error("INVALID_TRANSITION");
            await transaction.complaint.update({
                where: { id: complaint.id },
                data: {
                    status: "SELESAI",
                    completedAt: new Date(),
                    ...(input.note ? { officialResponse: input.note, respondedAt: new Date() } : {}),
                },
            });
            await transaction.complaintLog.create({
                data: { complaintId: complaint.id, actorUserId, action: "STATUS_CHANGED", fromStatus: complaint.status, toStatus: "SELESAI", note: input.note || null },
            });
            await transaction.notification.create({
                data: {
                    recipientId: complaint.reporterUserId,
                    type: "COMPLAINT_UPDATED",
                    title: "Status pengaduan berubah",
                    message: `Pengaduan ${complaint.ticketNumber} telah selesai ditangani.`,
                    complaintId: complaint.id,
                },
            });
            return { id: complaint.id };
        }

        // REJECT
        if (complaint.status !== "MENUNGGU" && complaint.status !== "DIPROSES") throw new Error("INVALID_TRANSITION");
        if (!input.note) throw new Error("NOTE_REQUIRED");
        await transaction.complaint.update({
            where: { id: complaint.id },
            data: { status: "DITOLAK", rejectedAt: new Date(), officialResponse: input.note, respondedAt: new Date() },
        });
        await transaction.complaintLog.create({
            data: { complaintId: complaint.id, actorUserId, action: "STATUS_CHANGED", fromStatus: complaint.status, toStatus: "DITOLAK", note: input.note },
        });
        await transaction.notification.create({
            data: {
                recipientId: complaint.reporterUserId,
                type: "COMPLAINT_UPDATED",
                title: "Status pengaduan berubah",
                message: `Pengaduan ${complaint.ticketNumber} ditolak.`,
                complaintId: complaint.id,
            },
        });
        return { id: complaint.id };
    });
}

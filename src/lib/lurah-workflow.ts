import { z } from "zod";
import type { PrismaClient } from "@/generated/prisma/client";
import type { HandlingStatus } from "@/generated/prisma/client";

export const lurahActionSchema = z.object({
    complaintId: z.string().trim().min(1),
    action: z.enum(["START", "RESPOND", "COMPLETE", "OUTSIDE_AUTHORITY"]),
    response: z.string().trim().max(5000, "Respon maksimal 5.000 karakter.").optional(),
});

export async function applyLurahAction(
    prisma: PrismaClient,
    input: z.infer<typeof lurahActionSchema>,
    actorUserId: string,
) {
    return prisma.$transaction(async (transaction) => {
        const complaint = await transaction.complaint.findUnique({
            where: { id: input.complaintId },
            select: { id: true, handlingStatus: true, reporterUserId: true, ticketNumber: true },
        });
        if (!complaint) throw new Error("COMPLAINT_NOT_FOUND");

        if (input.action === "RESPOND") {
            if (!input.response) throw new Error("RESPONSE_REQUIRED");
            if (complaint.handlingStatus !== "DITERUSKAN_KE_LURAH" && complaint.handlingStatus !== "DALAM_PROSES") {
                throw new Error("INVALID_TRANSITION");
            }
            await transaction.complaint.update({
                where: { id: complaint.id },
                data: { officialResponse: input.response, respondedAt: new Date() },
            });
            await transaction.complaintLog.create({
                data: { complaintId: complaint.id, actorUserId, action: "RESPONSE_ADDED", note: input.response },
            });
            await transaction.notification.create({
                data: {
                    recipientId: complaint.reporterUserId,
                    type: "COMPLAINT_UPDATED",
                    title: "Pengaduan Anda mendapat respon",
                    message: `Pengaduan ${complaint.ticketNumber} telah mendapat respon dari Lurah.`,
                    complaintId: complaint.id,
                },
            });
            return { id: complaint.id, action: input.action };
        }

        const transitions: Record<Exclude<z.infer<typeof lurahActionSchema>["action"], "RESPOND">, { from: HandlingStatus; to: HandlingStatus }> = {
            START: { from: "DITERUSKAN_KE_LURAH", to: "DALAM_PROSES" },
            COMPLETE: { from: "DALAM_PROSES", to: "SELESAI" },
            OUTSIDE_AUTHORITY: { from: "DITERUSKAN_KE_LURAH", to: "DI_LUAR_KEWENANGAN" },
        };
        const transition = transitions[input.action];
        if (complaint.handlingStatus !== transition.from) throw new Error("INVALID_TRANSITION");

        await transaction.complaint.update({
            where: { id: complaint.id },
            data: {
                handlingStatus: transition.to,
                ...(input.response ? { officialResponse: input.response, respondedAt: new Date() } : {}),
            },
        });
        if (input.response) {
            await transaction.complaintLog.create({
                data: { complaintId: complaint.id, actorUserId, action: "RESPONSE_ADDED", note: input.response },
            });
        }
        await transaction.complaintLog.create({
            data: {
                complaintId: complaint.id,
                actorUserId,
                action: "STATUS_CHANGED",
                fromStatus: transition.from,
                toStatus: transition.to,
                note: input.response || null,
            },
        });
        await transaction.notification.create({
            data: {
                recipientId: complaint.reporterUserId,
                type: "COMPLAINT_UPDATED",
                title: "Status pengaduan berubah",
                message: `Pengaduan ${complaint.ticketNumber} sekarang ${transition.to.replaceAll("_", " ")}.`,
                complaintId: complaint.id,
            },
        });

        return { id: complaint.id, action: input.action, handlingStatus: transition.to };
    });
}

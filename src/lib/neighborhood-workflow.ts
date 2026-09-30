import { z } from "zod";
import type { PrismaClient } from "@/generated/prisma/client";

export const workflowActionSchema = z.object({
    complaintId: z.string().trim().min(1),
    action: z.enum(["VERIFY", "ADD_NOTE", "FORWARD"]),
    note: z.string().trim().max(5000, "Catatan maksimal 5.000 karakter.").optional(),
});

export async function applyNeighborhoodAction(
    prisma: PrismaClient,
    input: z.infer<typeof workflowActionSchema>,
    actorUserId: string,
    lingkunganId: string,
) {
    return prisma.$transaction(async (transaction) => {
        const complaint = await transaction.complaint.findFirst({
            where: { id: input.complaintId, lingkunganId },
            select: { id: true, handlingStatus: true },
        });
        if (!complaint) throw new Error("COMPLAINT_NOT_FOUND");

        if (input.action === "ADD_NOTE") {
            if (!input.note) throw new Error("NOTE_REQUIRED");
            await transaction.complaint.update({
                where: { id: complaint.id },
                data: { internalNote: input.note },
            });
            await transaction.complaintLog.create({
                data: {
                    complaintId: complaint.id,
                    actorUserId,
                    action: "INTERNAL_NOTE_ADDED",
                    note: input.note,
                },
            });
            return { id: complaint.id, action: input.action };
        }

        const expectedStatus = input.action === "VERIFY" ? "DIAJUKAN" : "DIVERIFIKASI";
        const nextStatus = input.action === "VERIFY" ? "DIVERIFIKASI" : "DITERUSKAN_KE_LURAH";
        const action = input.action === "VERIFY" ? "VERIFIED" : "FORWARDED_TO_LURAH";
        if (complaint.handlingStatus !== expectedStatus) throw new Error("INVALID_TRANSITION");

        await transaction.complaint.update({
            where: { id: complaint.id },
            data: { handlingStatus: nextStatus },
        });
        await transaction.complaintLog.create({
            data: {
                complaintId: complaint.id,
                actorUserId,
                action,
                fromStatus: expectedStatus,
                toStatus: nextStatus,
                note: input.note || null,
            },
        });

        return { id: complaint.id, action: input.action, handlingStatus: nextStatus };
    });
}

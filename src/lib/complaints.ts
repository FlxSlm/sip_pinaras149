import { z } from "zod";
import type { PrismaClient } from "@/generated/prisma/client";

export const complaintInputSchema = z.object({
    lingkunganId: z.string().trim().min(1, "Lingkungan wajib dipilih."),
    title: z.string().trim().min(5, "Judul minimal 5 karakter.").max(120, "Judul maksimal 120 karakter."),
    category: z.string().trim().min(2, "Kategori wajib dipilih.").max(60, "Kategori tidak valid."),
    description: z.string().trim().min(1, "Deskripsi wajib diisi.").max(5000, "Deskripsi maksimal 5.000 karakter."),
});

export function periodKey(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    return `${year}${month}`;
}

export function formatTicketNumber(key: string, sequence: number): string {
    return `LPR-${key}-${String(sequence).padStart(3, "0")}`;
}

export async function createComplaint(
    prisma: PrismaClient,
    input: z.infer<typeof complaintInputSchema>,
    reporterUserId: string,
    evidenceFiles: Array<{ path: string; mimeType: string; sizeBytes: number }>,
) {
    return prisma.$transaction(async (transaction) => {
        const lingkungan = await transaction.lingkungan.findFirst({
            where: { id: input.lingkunganId, active: true },
            select: { id: true },
        });
        if (!lingkungan) {
            throw new Error("LINGKUNGAN_INVALID");
        }

        const now = new Date();
        const key = periodKey(now);
        const sequence = await transaction.ticketSequence.upsert({
            where: { periodKey: key },
            create: { periodKey: key, currentValue: 1 },
            update: { currentValue: { increment: 1 } },
            select: { currentValue: true },
        });
        const ticketNumber = formatTicketNumber(key, sequence.currentValue);

        const complaint = await transaction.complaint.create({
            data: {
                reporterUserId,
                lingkunganId: lingkungan.id,
                ticketNumber,
                title: input.title,
                category: input.category,
                description: input.description,
                evidencePath: evidenceFiles[0]?.path ?? null,
                handlingStatus: "DIAJUKAN",
                publicationStatus: "DRAFT",
                logs: {
                    create: {
                        actorUserId: reporterUserId,
                        action: "CREATED",
                        toStatus: "DIAJUKAN",
                    },
                },
            },
            select: { id: true, ticketNumber: true },
        });

        if (evidenceFiles.length > 0) {
            await transaction.complaintEvidence.createMany({
                data: evidenceFiles.map((file) => ({ complaintId: complaint.id, ...file })),
            });
        }

        const recipients = await transaction.user.findMany({
            where: {
                OR: [
                    { role: "lurah" },
                    { role: "kepala_lingkungan", lingkunganId: lingkungan.id },
                ],
            },
            select: { id: true },
        });
        if (recipients.length > 0) {
            await transaction.notification.createMany({
                data: recipients.map((recipient) => ({
                    recipientId: recipient.id,
                    type: "COMPLAINT_RECEIVED" as const,
                    title: "Pengaduan baru masuk",
                    message: `${input.title} (${ticketNumber}) perlu ditinjau.`,
                    complaintId: complaint.id,
                })),
            });
        }

        return complaint;
    });
}

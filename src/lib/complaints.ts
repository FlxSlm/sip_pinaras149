import { z } from "zod";
import type { PrismaClient } from "@/generated/prisma/client";

export const complaintInputSchema = z.object({
    title: z.string().trim().min(5, "Judul minimal 5 karakter.").max(120, "Judul maksimal 120 karakter."),
    category: z.string().trim().min(2, "Kategori wajib dipilih.").max(60, "Kategori tidak valid."),
    description: z.string().trim().min(1, "Deskripsi wajib diisi.").max(5000, "Deskripsi maksimal 5.000 karakter."),
    location: z.string().trim().max(200, "Lokasi maksimal 200 karakter.").optional(),
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
                ticketNumber,
                title: input.title,
                category: input.category,
                description: input.description,
                location: input.location || null,
                status: "MENUNGGU",
                logs: {
                    create: {
                        actorUserId: reporterUserId,
                        action: "CREATED",
                        toStatus: "MENUNGGU",
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

        const admins = await transaction.user.findMany({
            where: { role: "ADMIN_KELURAHAN" },
            select: { id: true },
        });
        if (admins.length > 0) {
            await transaction.notification.createMany({
                data: admins.map((admin) => ({
                    recipientId: admin.id,
                    type: "COMPLAINT_RECEIVED" as const,
                    title: "Pengaduan baru masuk",
                    message: `${input.title} (${ticketNumber}) perlu ditindaklanjuti.`,
                    complaintId: complaint.id,
                })),
            });
        }

        return complaint;
    });
}

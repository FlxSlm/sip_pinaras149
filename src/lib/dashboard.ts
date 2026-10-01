import type { PrismaClient } from "@/generated/prisma/client";

export async function getComplaintStats(prisma: PrismaClient, where: { reporterUserId?: string; lingkunganId?: string }) {
    const [total, selesai, dalamProses, ditolak] = await Promise.all([
        prisma.complaint.count({ where }),
        prisma.complaint.count({ where: { ...where, handlingStatus: "SELESAI" } }),
        prisma.complaint.count({ where: { ...where, handlingStatus: "DALAM_PROSES" } }),
        prisma.complaint.count({ where: { ...where, handlingStatus: "DI_LUAR_KEWENANGAN" } }),
    ]);
    return { total, selesai, dalamProses, ditolak };
}

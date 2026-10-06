import type { PrismaClient } from "@/generated/prisma/client";

export async function getComplaintStats(prisma: PrismaClient, where: { reporterUserId?: string } = {}) {
    const [total, menunggu, diproses, selesai, ditolak] = await Promise.all([
        prisma.complaint.count({ where }),
        prisma.complaint.count({ where: { ...where, status: "MENUNGGU" } }),
        prisma.complaint.count({ where: { ...where, status: "DIPROSES" } }),
        prisma.complaint.count({ where: { ...where, status: "SELESAI" } }),
        prisma.complaint.count({ where: { ...where, status: "DITOLAK" } }),
    ]);
    return { total, menunggu, diproses, selesai, ditolak };
}

import type { UserRole } from "@/generated/prisma/client";

/**
 * Akses ke complaint privat / bukti.
 * - ADMIN_KELURAHAN: seluruh complaint.
 * - WARGA: hanya complaint miliknya sendiri.
 */
export function canAccessComplaint(
    user: { id: string; role: UserRole },
    complaint: { reporterUserId: string },
): boolean {
    if (user.role === "ADMIN_KELURAHAN") return true;
    return user.role === "WARGA" && complaint.reporterUserId === user.id;
}

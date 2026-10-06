import type { UserRole } from "@/generated/prisma/client";

export function getRoleHome(role: UserRole | undefined): string {
    if (role === "ADMIN_KELURAHAN") return "/admin";
    return "/warga";
}

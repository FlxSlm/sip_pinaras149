import type { UserRole } from "@/generated/prisma/client";

export function getRoleHome(role: UserRole | undefined): string {
    if (role === "lurah") return "/petugas/lurah";
    if (role === "kepala_lingkungan") return "/petugas/lingkungan";
    return "/warga";
}
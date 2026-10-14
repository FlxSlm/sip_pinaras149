import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getDashboardSession } from "@/lib/dashboard-session";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/dashboard-shell";

export async function DashboardLayout({ role, children }: { role: "admin" | "warga"; children: ReactNode }) {
    const session = await getDashboardSession();
    if (!session?.user.id) redirect("/login");
    const expected = role === "admin" ? "ADMIN_KELURAHAN" : "WARGA";
    if (session.user.role !== expected) redirect(role === "admin" ? "/warga" : "/admin");
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, username: true, email: true, image: true, customImage: true, updatedAt: true } });
    if (!user) redirect("/login");
    const account = { name: user.name, username: user.username, email: user.email, image: user.customImage ? `/api/profile/photo?v=${user.updatedAt.getTime()}` : user.image };
    return <DashboardShell role={role} userName={user.name ?? "Pengguna SIPP"} initialAccount={account}>{children}</DashboardShell>;
}

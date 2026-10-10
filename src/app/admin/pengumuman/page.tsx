import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AnnouncementManager } from "@/components/announcement-manager";
import { DashboardShell } from "@/components/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    if (session.user.role !== "ADMIN_KELURAHAN") redirect("/warga");

    return (
        <DashboardShell role="admin" userName={session.user.name ?? session.user.email ?? "Admin Kelurahan"}>
            <div className="mx-auto max-w-6xl">
                <h1 className="text-2xl font-extrabold text-[var(--ink)]">Pengumuman</h1>
                <p className="mt-1 text-sm text-[var(--muted)]">Kelola pengumuman publik. Hanya pengumuman berstatus Terbit yang tampil di landing page.</p>
                <div className="mt-6">
                    <AnnouncementManager />
                </div>
            </div>
        </DashboardShell>
    );
}

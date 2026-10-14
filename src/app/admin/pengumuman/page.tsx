import { getDashboardSession } from "@/lib/dashboard-session";
import { redirect } from "next/navigation";
import { AnnouncementManager } from "@/components/announcement-manager";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
    const session = await getDashboardSession();
    if (!session) redirect("/login");
    if (session.user.role !== "ADMIN_KELURAHAN") redirect("/warga");

    return (
        <>
            <div className="mx-auto max-w-6xl">
                <h1 className="text-2xl font-extrabold text-[var(--ink)]">Pengumuman</h1>
                <p className="mt-1 text-sm text-[var(--muted)]">Kelola pengumuman publik. Hanya pengumuman berstatus Terbit yang tampil di landing page.</p>
                <div className="mt-6">
                    <AnnouncementManager />
                </div>
            </div>
        </>
    );
}

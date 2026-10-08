import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { NotificationList } from "@/components/notification-list";
import { DashboardShell } from "@/components/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    if (session.user.role !== "ADMIN_KELURAHAN") redirect("/warga");

    return (
        <DashboardShell role="admin" userName={session.user.name ?? session.user.email ?? "Admin Kelurahan"}>
            <NotificationList complaintHrefPrefix="/admin/pengaduan" />
        </DashboardShell>
    );
}

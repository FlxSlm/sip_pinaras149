import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { NotificationList } from "@/components/notification-list";
import { DashboardShell } from "@/components/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function WargaNotificationsPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    if (session.user.role !== "WARGA") redirect("/admin");

    return (
        <DashboardShell role="warga" userName={session.user.name ?? session.user.email ?? "Warga"}>
            <NotificationList complaintHrefPrefix="/warga/pengaduan" />
        </DashboardShell>
    );
}

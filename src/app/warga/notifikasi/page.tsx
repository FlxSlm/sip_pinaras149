import { getDashboardSession } from "@/lib/dashboard-session";
import { redirect } from "next/navigation";
import { NotificationList } from "@/components/notification-list";

export const dynamic = "force-dynamic";

export default async function WargaNotificationsPage() {
    const session = await getDashboardSession();
    if (!session) redirect("/login");
    if (session.user.role !== "WARGA") redirect("/admin");

    return (
        <>
            <NotificationList complaintHrefPrefix="/warga/pengaduan" />
        </>
    );
}

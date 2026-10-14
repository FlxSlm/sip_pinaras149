import { getDashboardSession } from "@/lib/dashboard-session";
import { redirect } from "next/navigation";
import { NotificationList } from "@/components/notification-list";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
    const session = await getDashboardSession();
    if (!session) redirect("/login");
    if (session.user.role !== "ADMIN_KELURAHAN") redirect("/warga");

    return (
        <>
            <NotificationList complaintHrefPrefix="/admin/pengaduan" />
        </>
    );
}

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getComplaintStats } from "@/lib/dashboard";
import { StatusBadge } from "@/components/status-badge";
import { DonutChart } from "@/components/donut-chart";
import { DashboardShell } from "@/components/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    if (session.user.role !== "ADMIN_KELURAHAN") redirect("/warga");

    const userId = session.user.id;
    const userName = session.user.name ?? session.user.email ?? "Admin Kelurahan";

    const [stats, recentComplaints, recentNotifications, priorities] = await Promise.all([
        getComplaintStats(prisma),
        prisma.complaint.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            select: { id: true, ticketNumber: true, title: true, status: true, createdAt: true },
        }),
        prisma.notification.findMany({
            where: { recipientId: userId },
            orderBy: { createdAt: "desc" },
            take: 5,
            select: { id: true, title: true, message: true, readAt: true, createdAt: true, complaint: { select: { ticketNumber: true } }, announcementId: true },
        }),
        prisma.complaint.groupBy({ by: ["priority"], _count: { _all: true } }),
    ]);

    const statCards = [
        { label: "Total Pengaduan", value: stats.total, color: "text-[var(--brand)]", bg: "bg-[#eef5f9]", icon: <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-9 14H7v-2h3v2Zm0-4H7v-2h3v2Zm0-4H7V7h3v2Zm6 8h-4v-2h4v2Zm0-4h-4v-2h4v2Zm0-4h-4V7h4v2Z" /> },
        { label: "Menunggu", value: stats.menunggu, color: "text-[var(--gold)]", bg: "bg-[#fcf6e8]", icon: <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2ZM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8Zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7Z" /> },
        { label: "Diproses", value: stats.diproses, color: "text-[var(--brand)]", bg: "bg-[#eef5f9]", icon: <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /> },
        { label: "Selesai", value: stats.selesai, color: "text-[var(--leaf)]", bg: "bg-[#eaf4ef]", icon: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z" /> },
    ];

    const chartDataRingkasan = [
        { label: "Menunggu", value: stats.menunggu, color: "#c08a1a" },
        { label: "Diproses", value: stats.diproses, color: "#0d5a8e" },
        { label: "Selesai", value: stats.selesai, color: "#1f8a5c" },
        { label: "Ditolak", value: stats.ditolak, color: "#c8323e" },
    ];

    const chartDataTindaklanjut = [
        { label: "Normal", value: priorities.find((p) => p.priority === "NORMAL")?._count._all ?? 0, color: "#087ac1" },
        { label: "Perlu perhatian", value: priorities.find((p) => p.priority === "PERLU_PERHATIAN")?._count._all ?? 0, color: "#c8323e" },
        { label: "Belum ditentukan", value: priorities.find((p) => p.priority === null)?._count._all ?? 0, color: "#587094" },
    ];

    return (
        <DashboardShell role="admin" userName={userName}>
            <div className="mx-auto max-w-[1400px]">
                {/* Welcome Header */}
                <div className="dashboard-hero mb-6 rounded-2xl p-6 text-white shadow-sm sm:p-8">
                    <p className="text-sm font-semibold text-white/90">Selamat Datang,</p>
                    <h1 className="mt-1 text-3xl font-extrabold text-white sm:text-4xl">{userName}</h1>
                    <p className="mt-2 text-sm text-white/85">Kelola pengaduan, pengumuman dan konten landing page untuk pelayanan publik yang lebih baik.</p>
                </div>

                {/* Stat Cards */}
                <div className="mb-6 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                    {statCards.map((item) => (
                        <div key={item.label} className="flex flex-col rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[13px] font-semibold text-[var(--ink)]">{item.label}</p>
                                    <p className="mt-2 text-4xl font-extrabold text-[var(--brand-deep)]">{item.value}</p>
                                </div>
                                <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${item.bg} ${item.color}`}>
                                    <svg viewBox="0 0 24 24" className="size-6" fill="currentColor">{item.icon}</svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts */}
                <div className="mb-6 grid gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
                        <h2 className="mb-6 text-lg font-extrabold text-[var(--brand-deep)]">Ringkasan Pengaduan</h2>
                        <DonutChart data={chartDataRingkasan} title="Status pengaduan" />
                    </div>
                    <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-[var(--brand-deep)]">Prioritas Pengaduan</h2>
                        <DonutChart data={chartDataTindaklanjut} title="Prioritas pengaduan" />
                    </div>
                </div>

                {/* Recent Info */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Complaints Table */}
                    <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-lg font-extrabold text-[var(--brand-deep)]">Pengaduan Terbaru</h2>
                            <Link href="/admin/pengaduan" className="text-sm font-bold text-[var(--brand)] hover:underline">Lihat Semua →</Link>
                        </div>
                        {recentComplaints.length === 0 ? (
                            <p className="text-sm text-[var(--muted)]">Belum ada pengaduan yang dibuat.</p>
                        ) : (
                            <div className="-mx-2 overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-[var(--line)] text-[12px] font-bold text-[var(--ink)]">
                                            <th className="px-2 py-3 font-bold">No. Tiket</th>
                                            <th className="px-2 py-3 font-bold">Judul Pengaduan</th>
                                            <th className="px-2 py-3 font-bold">Status</th>
                                            <th className="px-2 py-3 font-bold">Tanggal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--surface-2)]">
                                        {recentComplaints.map((c) => (
                                            <tr key={c.id} className="transition hover:bg-[var(--surface)]">
                                                <td className="px-2 py-3 font-mono text-[11px] font-bold tracking-wider text-[var(--muted)]">
                                                    <Link href={`/admin/pengaduan/${c.ticketNumber}`} className="flex items-center gap-2 hover:text-[var(--brand)]">
                                                        <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-[var(--brand)]" fill="currentColor"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-9 14H7v-2h3v2Zm0-4H7v-2h3v2Zm0-4H7V7h3v2Zm6 8h-4v-2h4v2Zm0-4h-4v-2h4v2Zm0-4h-4V7h4v2Z" /></svg>
                                                        {c.ticketNumber}
                                                    </Link>
                                                </td>
                                                <td className="px-2 py-3 font-semibold text-[var(--brand-deep)]">
                                                    <Link href={`/admin/pengaduan/${c.ticketNumber}`} className="hover:underline">{c.title}</Link>
                                                </td>
                                                <td className="px-2 py-3">
                                                    <StatusBadge status={c.status} />
                                                </td>
                                                <td className="px-2 py-3 text-[12px] text-[var(--muted)]">
                                                    {new Date(c.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Recent Notifications */}
                    <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-lg font-extrabold text-[var(--brand-deep)]">Notifikasi Terbaru</h2>
                            <Link href="/admin/notifikasi" className="text-sm font-bold text-[var(--brand)] hover:underline">Lihat Semua →</Link>
                        </div>
                        {recentNotifications.length === 0 ? (
                            <p className="text-sm text-[var(--muted)]">Belum ada notifikasi.</p>
                        ) : (
                            <div className="space-y-4">
                                {recentNotifications.map((n) => {
                                    const isUnread = !n.readAt;
                                    const isComplete = n.title.toLowerCase().includes("selesai");
                                    const isAnnounce = Boolean(n.announcementId);
                                    
                                    let iconContent;
                                    if (isComplete) {
                                        iconContent = <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eaf4ef] text-[var(--leaf)]"><svg viewBox="0 0 24 24" className="size-5" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z" /></svg></div>;
                                    } else if (isAnnounce) {
                                        iconContent = <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eef5f9] text-[var(--brand)]"><svg viewBox="0 0 24 24" className="size-4.5" fill="currentColor"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-9 14H7v-2h3v2Zm0-4H7v-2h3v2Zm0-4H7V7h3v2Zm6 8h-4v-2h4v2Zm0-4h-4v-2h4v2Zm0-4h-4V7h4v2Z" /></svg></div>;
                                    } else {
                                        iconContent = <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eef5f9] text-[var(--brand)]"><svg viewBox="0 0 24 24" className="size-5" fill="currentColor"><path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2Z" /></svg></div>;
                                    }
                                    
                                    const href = n.complaint ? `/admin/pengaduan/${n.complaint.ticketNumber}` : n.announcementId ? "/admin/pengumuman" : "/admin/notifikasi";
                                    
                                    return (
                                        <Link key={n.id} href={href} className="flex items-center gap-4 rounded-xl p-2 transition hover:bg-[var(--surface)]">
                                            {iconContent}
                                            <div className="min-w-0 flex-1">
                                                <p className={`text-[13px] ${isUnread ? "font-bold text-[var(--ink)]" : "font-semibold text-[var(--brand-deep)]"}`}>{n.title}</p>
                                                <p className="truncate text-[11px] text-[var(--muted)]">
                                                    {n.complaint ? n.complaint.ticketNumber + " - " + n.message : n.message}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-2 text-right">
                                                <span className="text-[11px] text-[var(--muted)] whitespace-nowrap">{new Date(n.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                                                {isUnread ? <span className="size-2 rounded-full bg-[var(--brand)]" /> : <span className="size-2 rounded-full bg-transparent" />}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}

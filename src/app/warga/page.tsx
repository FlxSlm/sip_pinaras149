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

export default async function WargaDashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    if (session.user.role !== "WARGA") redirect("/admin");

    const userId = session.user.id;
    const userName = session.user.name ?? session.user.email ?? "Warga";

    const [stats, recentComplaints, recentNotifications] = await Promise.all([
        getComplaintStats(prisma, { reporterUserId: userId }),
        prisma.complaint.findMany({
            where: { reporterUserId: userId },
            orderBy: { createdAt: "desc" },
            take: 4,
            select: { id: true, ticketNumber: true, title: true, status: true, createdAt: true },
        }),
        prisma.notification.findMany({
            where: { recipientId: userId },
            orderBy: { createdAt: "desc" },
            take: 4,
            select: { id: true, title: true, message: true, readAt: true, createdAt: true, complaint: { select: { ticketNumber: true } }, announcementId: true },
        }),
    ]);

    const statCards = [
        { label: "Total Pengaduan", value: stats.total, color: "text-[var(--brand)]", bg: "bg-[#eef5f9]", icon: <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-9 14H7v-2h3v2Zm0-4H7v-2h3v2Zm0-4H7V7h3v2Zm6 8h-4v-2h4v2Zm0-4h-4v-2h4v2Zm0-4h-4V7h4v2Z" /> },
        { label: "Menunggu", value: stats.menunggu, color: "text-[var(--gold)]", bg: "bg-[#fcf6e8]", icon: <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2ZM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8Zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7Z" /> },
        { label: "Diproses", value: stats.diproses, color: "text-[var(--brand)]", bg: "bg-[#eef5f9]", icon: <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /> },
        { label: "Selesai", value: stats.selesai, color: "text-[var(--leaf)]", bg: "bg-[#eaf4ef]", icon: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z" /> },
    ];

    const chartData = [
        { label: "Menunggu", value: stats.menunggu, color: "#c08a1a" },
        { label: "Diproses", value: stats.diproses, color: "#0d5a8e" },
        { label: "Selesai", value: stats.selesai, color: "#1f8a5c" },
    ];

    return (
        <DashboardShell role="warga" userName={userName}>
            <div className="mx-auto max-w-[1400px]">
                {/* Welcome Header */}
                <div className="dashboard-hero mb-6 rounded-2xl p-6 text-white shadow-sm sm:p-8">
                    <p className="text-sm font-semibold text-white/90">Selamat Datang,</p>
                    <h1 className="mt-1 text-3xl font-extrabold text-white sm:text-4xl">{userName}</h1>
                    <p className="mt-2 text-sm text-white/85">Semoga hari Anda menyenangkan. Berikut ringkasan aktivitas di SIPP.</p>
                </div>

                {/* Stat Cards */}
                <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((item) => (
                        <div key={item.label} className="flex items-center gap-5 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
                            <div className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${item.bg} ${item.color}`}>
                                <svg viewBox="0 0 24 24" className="size-7" fill="currentColor">{item.icon}</svg>
                            </div>
                            <div>
                                <p className="text-[13px] font-semibold text-[var(--muted)]">{item.label}</p>
                                <p className="text-2xl font-extrabold text-[var(--ink)]">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 3-Column Grid */}
                <div className="mb-6 grid gap-6 lg:grid-cols-3">
                    {/* Donut Chart */}
                    <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
                        <h2 className="mb-6 text-lg font-extrabold text-[var(--ink)]">Status Pengaduan</h2>
                        <DonutChart data={chartData} />
                    </div>

                    {/* Recent Complaints */}
                    <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-lg font-extrabold text-[var(--ink)]">Pengaduan Terbaru</h2>
                            <Link href="/warga/pengaduan" className="text-sm font-bold text-[var(--brand)] hover:underline">Lihat Semua →</Link>
                        </div>
                        {recentComplaints.length === 0 ? (
                            <p className="text-sm text-[var(--muted)]">Belum ada pengaduan yang dibuat.</p>
                        ) : (
                            <div className="space-y-4">
                                {recentComplaints.map((c) => (
                                    <Link key={c.id} href={`/warga/pengaduan/${c.ticketNumber}`} className="group flex items-start gap-4 rounded-xl p-2 transition hover:bg-[var(--surface)]">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--brand)] group-hover:bg-white">
                                            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-9 14H7v-2h3v2Zm0-4H7v-2h3v2Zm0-4H7V7h3v2Zm6 8h-4v-2h4v2Zm0-4h-4v-2h4v2Zm0-4h-4V7h4v2Z" /></svg>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11px] font-bold tracking-wider text-[var(--brand)]">{c.ticketNumber}</p>
                                            <p className="truncate text-sm font-semibold text-[var(--ink)]">{c.title}</p>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                                            <StatusBadge status={c.status} />
                                            <span className="text-[11px] text-[var(--muted)]">{new Date(c.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Notifications */}
                    <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-lg font-extrabold text-[var(--ink)]">Notifikasi Terbaru</h2>
                            <Link href="/warga/notifikasi" className="text-sm font-bold text-[var(--brand)] hover:underline">Lihat Semua →</Link>
                        </div>
                        {recentNotifications.length === 0 ? (
                            <p className="text-sm text-[var(--muted)]">Belum ada notifikasi.</p>
                        ) : (
                            <div className="space-y-4">
                                {recentNotifications.map((n) => {
                                    const isUnread = !n.readAt;
                                    const icon = n.announcementId ? (
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#fcf6e8] text-[var(--gold)]"><svg viewBox="0 0 24 24" className="size-4.5" fill="currentColor"><path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2Z" /></svg></div>
                                    ) : (
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#eaf4ef] text-[var(--leaf)]"><svg viewBox="0 0 24 24" className="size-4.5" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z" /></svg></div>
                                    );
                                    
                                    const href = n.complaint ? `/warga/pengaduan/${n.complaint.ticketNumber}` : n.announcementId ? "/pengumuman" : "/warga/notifikasi";
                                    return (
                                        <Link key={n.id} href={href} className="flex items-start gap-3 rounded-xl p-2 transition hover:bg-[var(--surface)]">
                                            {icon}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm ${isUnread ? "font-bold text-[var(--ink)]" : "font-semibold text-[var(--muted)]"}`}>{n.title}</p>
                                                    {isUnread && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--brand)]" />}
                                                </div>
                                                <p className="truncate text-[12px] text-[var(--muted)]">{n.message}</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Info Banner */}
                    <div className="relative flex flex-col justify-end overflow-hidden rounded-2xl p-8 shadow-sm lg:col-span-2 min-h-[220px]">
                        <div className="absolute inset-0 z-0">
                            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,54,82,0.95)] via-[rgba(10,54,82,0.85)] to-transparent z-10" />
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/images/panorama-pinaras.png" alt="" className="size-full object-cover" />
                        </div>
                        <div className="relative z-20 max-w-lg">
                            <span className="rounded-full bg-[var(--leaf)] px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wider">Informasi</span>
                            <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">Pelayanan Publik yang Lebih Baik</h2>
                            <p className="mt-2 text-sm text-white/80 leading-relaxed">SIPP hadir untuk mempermudah masyarakat dalam menyampaikan pengaduan, mendapatkan informasi, dan berpartisipasi dalam pembangunan kelurahan.</p>
                            <Link href="/warga/pengaduan/buat" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-[var(--brand)] transition hover:bg-white/90">
                                Selengkapnya →
                            </Link>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm border border-[var(--line)]">
                        <h2 className="text-lg font-extrabold text-[var(--ink)] mb-1">Aksi Cepat</h2>
                        <Link href="/warga/pengaduan/buat" className="flex items-center justify-between rounded-xl bg-[var(--brand)] px-5 py-3.5 text-white transition hover:bg-[var(--brand-dark)]">
                            <span className="flex items-center gap-3 text-sm font-bold"><span className="flex size-6 items-center justify-center rounded-full bg-white/20 text-lg">＋</span> Ajukan Pengaduan</span>
                            <span>›</span>
                        </Link>
                        <Link href="/warga/pengaduan" className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface)] px-5 py-3.5 text-[var(--ink)] transition hover:bg-[var(--line)]">
                            <span className="flex items-center gap-3 text-sm font-bold"><svg viewBox="0 0 24 24" className="size-5 text-[var(--muted)]" fill="currentColor"><path d="M4 4h16v2H4V4Zm0 4h16v2H4V8Zm0 4h16v2H4v-2Zm0 4h16v2H4v-2Z" /></svg> Lihat Riwayat Pengaduan</span>
                            <span>›</span>
                        </Link>
                        <Link href="/warga/profil" className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface)] px-5 py-3.5 text-[var(--ink)] transition hover:bg-[var(--line)]">
                            <span className="flex items-center gap-3 text-sm font-bold"><svg viewBox="0 0 24 24" className="size-5 text-[var(--muted)]" fill="currentColor"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" /></svg> Edit Profil</span>
                            <span>›</span>
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}

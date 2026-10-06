import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getComplaintStats } from "@/lib/dashboard";
import { AnnouncementForm } from "@/components/announcement-form";
import { AdminInbox } from "@/components/admin-inbox";
import { DashboardShell } from "@/components/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    if (session.user.role !== "ADMIN_KELURAHAN") redirect("/warga");

    const [complaints, stats, priorityCounts] = await Promise.all([
        prisma.complaint.findMany({
            orderBy: { createdAt: "desc" },
            select: { id: true, ticketNumber: true, title: true, category: true, description: true, status: true, priority: true, createdAt: true },
        }),
        getComplaintStats(prisma),
        prisma.complaint.groupBy({ by: ["priority"], _count: { _all: true } }),
    ]);

    const statCards = [
        { label: "Total laporan", value: stats.total },
        { label: "Menunggu", value: stats.menunggu },
        { label: "Diproses", value: stats.diproses },
        { label: "Selesai", value: stats.selesai },
        { label: "Ditolak", value: stats.ditolak },
    ];

    const statusChart = [
        { label: "Menunggu", value: stats.menunggu, tone: "bg-[var(--gold)]" },
        { label: "Diproses", value: stats.diproses, tone: "bg-[var(--brand)]" },
        { label: "Selesai", value: stats.selesai, tone: "bg-[var(--leaf)]" },
        { label: "Ditolak", value: stats.ditolak, tone: "bg-[var(--danger)]" },
    ];
    const maxStatus = Math.max(1, ...statusChart.map((item) => item.value));

    const normalCount = priorityCounts.find((item) => item.priority === "NORMAL")?._count._all ?? 0;
    const attentionCount = priorityCounts.find((item) => item.priority === "PERLU_PERHATIAN")?._count._all ?? 0;
    const priorityTotal = Math.max(1, normalCount + attentionCount);

    return (
        <DashboardShell role="admin" userName={session.user.name ?? session.user.email ?? "Admin Kelurahan"}>
            <div className="mx-auto max-w-5xl">
                <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {statCards.map((item) => (
                        <div key={item.label} className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[0_10px_30px_rgba(18,50,59,0.05)]">
                            <p className="text-sm text-[var(--muted)]">{item.label}</p>
                            <p className="mt-2 text-3xl font-extrabold text-[var(--ink)]">{item.value}</p>
                        </div>
                    ))}
                </section>

                <section className="mt-6 grid gap-5 md:grid-cols-2">
                    <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-extrabold text-[var(--ink)]">Diagram status</h2>
                        <div className="mt-5 space-y-3">
                            {statusChart.map((item) => (
                                <div key={item.label}>
                                    <div className="flex justify-between text-sm font-semibold text-[var(--muted)]">
                                        <span>{item.label}</span>
                                        <span>{item.value}</span>
                                    </div>
                                    <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
                                        <div className={`h-full rounded-full ${item.tone}`} style={{ width: `${Math.round((item.value / maxStatus) * 100)}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-extrabold text-[var(--ink)]">Diagram prioritas</h2>
                        <div className="mt-6 space-y-4">
                            {[
                                { label: "Normal", value: normalCount, tone: "bg-[var(--brand)]" },
                                { label: "Perlu perhatian", value: attentionCount, tone: "bg-[var(--danger)]" },
                            ].map((item) => (
                                <div key={item.label}>
                                    <div className="flex justify-between text-sm font-semibold text-[var(--muted)]">
                                        <span>{item.label}</span>
                                        <span>{item.value}</span>
                                    </div>
                                    <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
                                        <div className={`h-full rounded-full ${item.tone}`} style={{ width: `${Math.round((item.value / priorityTotal) * 100)}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="mt-8">
                    <AnnouncementForm />
                </div>

                <div id="pengaduan" className="mt-8">
                    <AdminInbox initialComplaints={complaints.map((complaint) => ({ ...complaint, createdAt: complaint.createdAt.toISOString() }))} />
                </div>
            </div>
        </DashboardShell>
    );
}

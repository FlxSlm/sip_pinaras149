import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { NeighborhoodInbox } from "@/components/neighborhood-inbox";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getComplaintStats } from "@/lib/dashboard";
import { AnnouncementForm } from "@/components/announcement-form";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function LingkunganPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    if (session.user.role !== "kepala_lingkungan") redirect("/petugas");

    if (!session.user.lingkunganId) redirect("/login");
    const [lingkungan, complaints, stats] = await Promise.all([
        prisma.lingkungan.findUnique({ where: { id: session.user.lingkunganId }, select: { name: true } }),
        prisma.complaint.findMany({
            where: { lingkunganId: session.user.lingkunganId },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                ticketNumber: true,
                title: true,
                category: true,
                description: true,
                handlingStatus: true,
                internalNote: true,
                createdAt: true,
                reporter: { select: { name: true, email: true, phone: true } },
                evidences: { select: { id: true, path: true, mimeType: true } },
            },
        }),
        getComplaintStats(prisma, { lingkunganId: session.user.lingkunganId }),
    ]);

    const statCards = [
        { label: "Total laporan", value: stats.total },
        { label: "Selesai", value: stats.selesai },
        { label: "Diproses", value: stats.dalamProses },
        { label: "Ditolak", value: stats.ditolak },
    ];

    return (
        <DashboardShell role="kepala_lingkungan" userName={session.user.name ?? session.user.email ?? "Admin Kelurahan"} location={lingkungan?.name}>
            <div className="mx-auto max-w-5xl">
                <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((item) => (
                        <div key={item.label} className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[0_10px_30px_rgba(18,50,59,0.05)]">
                            <p className="text-sm text-[var(--muted)]">{item.label}</p>
                            <p className="mt-2 text-3xl font-extrabold text-[var(--ink)]">{item.value}</p>
                        </div>
                    ))}
                </section>
                <div className="mt-8">
                    <AnnouncementForm />
                </div>
                <div id="pengaduan" className="mt-8">
                    <NeighborhoodInbox initialComplaints={complaints.map((complaint) => ({ ...complaint, createdAt: complaint.createdAt.toISOString() }))} />
                </div>
            </div>
        </DashboardShell>
    );
}

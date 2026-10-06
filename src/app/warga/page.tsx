import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ComplaintForm } from "@/components/complaint-form";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/prisma";
import { getComplaintStats } from "@/lib/dashboard";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function WargaPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    if (session.user.role !== "WARGA") redirect("/admin");

    const [complaints, stats] = await Promise.all([
        prisma.complaint.findMany({
            where: { reporterUserId: session.user.id },
            orderBy: { createdAt: "desc" },
            select: { id: true, ticketNumber: true, title: true, category: true, status: true, createdAt: true },
        }),
        getComplaintStats(prisma, { reporterUserId: session.user.id }),
    ]);

    const statCards = [
        { label: "Total laporan", value: stats.total },
        { label: "Menunggu", value: stats.menunggu },
        { label: "Diproses", value: stats.diproses },
        { label: "Selesai", value: stats.selesai },
        { label: "Ditolak", value: stats.ditolak },
    ];

    return (
        <DashboardShell role="warga" userName={session.user.name ?? session.user.email ?? "Warga"}>
            <div className="mx-auto max-w-5xl">
                <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {statCards.map((item) => (
                        <div key={item.label} className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[0_10px_30px_rgba(18,50,59,0.05)]">
                            <p className="text-sm text-[var(--muted)]">{item.label}</p>
                            <p className="mt-2 text-3xl font-extrabold text-[var(--ink)]">{item.value}</p>
                        </div>
                    ))}
                </section>

                <section id="buat" className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_10px_30px_rgba(18,50,59,0.05)]">
                    <h2 className="text-xl font-extrabold text-[var(--ink)]">Buat pengaduan</h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">Pengaduan Anda akan diteruskan kepada Admin Kelurahan untuk ditindaklanjuti.</p>
                    <ComplaintForm />
                </section>

                <section id="riwayat" className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_10px_30px_rgba(18,50,59,0.05)]">
                    <h2 className="text-xl font-extrabold text-[var(--ink)]">Riwayat pengaduan</h2>
                    {complaints.length === 0 ? (
                        <p className="mt-4 rounded-xl bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">Belum ada pengaduan.</p>
                    ) : (
                        <div className="mt-4 divide-y divide-[var(--line)]">
                            {complaints.map((complaint) => (
                                <div key={complaint.id} className="flex items-center justify-between gap-4 py-4">
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand)]">{complaint.ticketNumber}</p>
                                        <p className="mt-1 truncate font-semibold text-[var(--ink)]">{complaint.title}</p>
                                        <p className="mt-1 text-sm text-[var(--muted)]">{complaint.category} · {complaint.createdAt.toLocaleDateString("id-ID")}</p>
                                    </div>
                                    <div className="shrink-0">
                                        <StatusBadge status={complaint.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section id="profil" className="mt-8 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_10px_30px_rgba(18,50,59,0.05)]">
                    <h2 className="text-xl font-extrabold text-[var(--ink)]">Profil</h2>
                    <div className="mt-4 flex items-center gap-4">
                        <div className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-[var(--leaf)] to-[var(--brand)] text-lg font-bold text-white">
                            {(session.user.name ?? session.user.email ?? "W").slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-[var(--ink)]">{session.user.name ?? "Warga Pinaras"}</p>
                            <p className="text-sm text-[var(--muted)]">{session.user.email}</p>
                            <p className="mt-1 text-xs text-[var(--muted)]">Identitas Anda terhubung dengan akun Google.</p>
                        </div>
                    </div>
                </section>

                <p className="mt-6 text-center text-xs text-[var(--muted)]">
                    Lihat forum pengaduan publik di <Link href="/pengaduan" className="font-semibold text-[var(--brand)]">/pengaduan</Link>.
                </p>
            </div>
        </DashboardShell>
    );
}

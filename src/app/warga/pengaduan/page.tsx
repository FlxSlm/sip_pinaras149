import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { DashboardShell } from "@/components/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function WargaComplaintsPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    if (session.user.role !== "WARGA") redirect("/admin");

    const complaints = await prisma.complaint.findMany({
        where: { reporterUserId: session.user.id },
        orderBy: { createdAt: "desc" },
        select: { id: true, ticketNumber: true, title: true, category: true, status: true, priority: true, createdAt: true },
    });

    return (
        <DashboardShell role="warga" userName={session.user.name ?? session.user.email ?? "Warga"}>
            <div className="mx-auto max-w-3xl">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-extrabold text-[var(--ink)]">Riwayat Pengaduan</h1>
                        <p className="mt-1 text-sm text-[var(--muted)]">{complaints.length} pengaduan</p>
                    </div>
                    <Link href="/warga/pengaduan/buat" className="rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-white">＋ Buat</Link>
                </div>

                {complaints.length === 0 ? (
                    <p className="mt-6 rounded-2xl border border-[var(--line)] bg-white p-8 text-sm text-[var(--muted)]">Belum ada pengaduan.</p>
                ) : (
                    <div className="mt-6 space-y-3">
                        {complaints.map((complaint) => (
                            <Link key={complaint.id} href={`/warga/pengaduan/${complaint.ticketNumber}`} className="block rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand)]">{complaint.ticketNumber}</p>
                                        <p className="mt-1 truncate font-bold text-[var(--ink)]">{complaint.title}</p>
                                        <p className="mt-1 text-sm text-[var(--muted)]">{complaint.category} · {complaint.createdAt.toLocaleDateString("id-ID")}</p>
                                    </div>
                                    <StatusBadge status={complaint.status} />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { DashboardShell } from "@/components/dashboard-shell";

export const dynamic = "force-dynamic";

const priorityLabel: Record<string, string> = { NORMAL: "Normal", PERLU_PERHATIAN: "Perlu perhatian" };

export default async function AdminComplaintsPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    if (session.user.role !== "ADMIN_KELURAHAN") redirect("/warga");

    const complaints = await prisma.complaint.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, ticketNumber: true, title: true, category: true, status: true, priority: true, createdAt: true },
    });

    const toDo = complaints.filter((complaint) => complaint.status === "MENUNGGU" || complaint.status === "DIPROSES");
    const done = complaints.filter((complaint) => complaint.status === "SELESAI" || complaint.status === "DITOLAK");

    return (
        <DashboardShell role="admin" userName={session.user.name ?? session.user.email ?? "Admin Kelurahan"}>
            <div className="mx-auto max-w-6xl">
                <h1 className="text-2xl font-extrabold text-[var(--ink)]">Pengaduan</h1>

                <section className="mt-6">
                    <h2 className="text-lg font-extrabold text-[var(--ink)]">Perlu ditindaklanjuti</h2>
                    {toDo.length === 0 ? (
                        <p className="mt-3 rounded-2xl border border-[var(--line)] bg-white p-6 text-sm text-[var(--muted)]">Tidak ada pengaduan yang perlu ditindaklanjuti.</p>
                    ) : (
                        <div className="mt-3 space-y-3">
                            {toDo.map((complaint) => (
                                <Link key={complaint.id} href={`/admin/pengaduan/${complaint.ticketNumber}`} className="block rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand)]">{complaint.ticketNumber}</p>
                                            <p className="mt-1 truncate font-bold text-[var(--ink)]">{complaint.title}</p>
                                            <p className="mt-1 text-sm text-[var(--muted)]">{complaint.category} · {complaint.createdAt.toLocaleDateString("id-ID")}</p>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                                            <StatusBadge status={complaint.status} />
                                            {complaint.priority && <span className="rounded-full bg-[var(--surface)] px-2 py-0.5 text-xs font-bold text-[var(--muted)]">{priorityLabel[complaint.priority]}</span>}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                <section className="mt-8">
                    <h2 className="text-lg font-extrabold text-[var(--ink)]">Sudah selesai</h2>
                    {done.length === 0 ? (
                        <p className="mt-3 rounded-2xl border border-[var(--line)] bg-white p-6 text-sm text-[var(--muted)]">Belum ada pengaduan yang selesai atau ditolak.</p>
                    ) : (
                        <div className="mt-3 divide-y divide-[var(--line)] rounded-2xl border border-[var(--line)] bg-white shadow-sm">
                            {done.map((complaint) => (
                                <Link key={complaint.id} href={`/admin/pengaduan/${complaint.ticketNumber}`} className="flex items-center justify-between gap-3 p-4 transition hover:bg-[var(--surface)]">
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand)]">{complaint.ticketNumber}</p>
                                        <p className="truncate font-semibold text-[var(--ink)]">{complaint.title}</p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <StatusBadge status={complaint.status} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </DashboardShell>
    );
}

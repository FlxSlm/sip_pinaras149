import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { EvidenceGallery } from "@/components/evidence-gallery";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { AdminComplaintActions } from "@/components/admin-complaint-actions";
import { DashboardShell } from "@/components/dashboard-shell";

export const dynamic = "force-dynamic";

const actionLabel: Record<string, string> = {
    CREATED: "Pengaduan dibuat",
    OPENED: "Pengaduan dibuka",
    STATUS_CHANGED: "Status berubah",
    PRIORITY_CHANGED: "Prioritas ditentukan",
    RESPONSE_ADDED: "Tanggapan diberikan",
    NOTE_ADDED: "Catatan ditambahkan",
};

const priorityLabel: Record<string, string> = { NORMAL: "Normal", PERLU_PERHATIAN: "Perlu perhatian" };

export default async function AdminComplaintDetailPage({ params }: { params: Promise<{ ticketNumber: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    if (session.user.role !== "ADMIN_KELURAHAN") redirect("/warga");

    const { ticketNumber } = await params;
    const complaint = await prisma.complaint.findUnique({
        where: { ticketNumber },
        select: {
            id: true,
            ticketNumber: true,
            title: true,
            category: true,
            description: true,
            location: true,
            status: true,
            priority: true,
            internalNote: true,
            officialResponse: true,
            createdAt: true,
            openedAt: true,
            completedAt: true,
            rejectedAt: true,
            reporter: { select: { name: true, email: true } },
            evidences: { select: { id: true, path: true, mimeType: true } },
            logs: { orderBy: { createdAt: "asc" }, select: { id: true, action: true, fromStatus: true, toStatus: true, oldPriority: true, newPriority: true, note: true, createdAt: true } },
        },
    });

    if (!complaint) notFound();

    return (
        <DashboardShell role="admin" userName={session.user.name ?? session.user.email ?? "Admin Kelurahan"}>
            <div className="mx-auto max-w-6xl">
                <Link href="/admin/pengaduan" className="text-sm font-bold text-[var(--brand)]">← Kembali ke daftar pengaduan</Link>

                <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                    <div className="space-y-6">
                        <article className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand)]">{complaint.ticketNumber}</p>
                                <div className="flex gap-2">
                                    <StatusBadge status={complaint.status} />
                                    {complaint.priority && <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[var(--muted)]">{priorityLabel[complaint.priority]}</span>}
                                </div>
                            </div>
                            <h1 className="mt-2 text-2xl font-extrabold text-[var(--ink)]">{complaint.title}</h1>
                            <p className="mt-2 text-sm text-[var(--muted)]">{complaint.category} · {complaint.createdAt.toLocaleDateString("id-ID")}</p>
                            {complaint.location && <p className="mt-2 text-sm text-[var(--muted)]">Lokasi: {complaint.location}</p>}

                            <h2 className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Deskripsi</h2>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--ink)]">{complaint.description}</p>

                            {complaint.evidences.length > 0 && (
                                <>
                                    <h2 className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Bukti foto</h2>
                                    <EvidenceGallery ticketNumber={complaint.ticketNumber} evidenceIds={complaint.evidences.map((e) => e.id)} />
                                </>
                            )}
                        </article>

                        <section className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-extrabold text-[var(--ink)]">Riwayat status</h2>
                            <ol className="mt-4 space-y-4">
                                {complaint.logs.map((log) => (
                                    <li key={log.id} className="relative border-l-2 border-[var(--line)] pl-5">
                                        <p className="text-sm font-bold text-[var(--ink)]">{actionLabel[log.action] ?? log.action}</p>
                                        {log.fromStatus && log.toStatus && <p className="mt-1 text-xs text-[var(--muted)]">{log.fromStatus} → {log.toStatus}</p>}
                                        {log.newPriority && <p className="mt-1 text-xs text-[var(--muted)]">Prioritas: {priorityLabel[log.newPriority] ?? log.newPriority}</p>}
                                        {log.note && <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--muted)]">{log.note}</p>}
                                        <time className="mt-1 block text-xs text-[var(--muted)]">{log.createdAt.toLocaleString("id-ID")}</time>
                                    </li>
                                ))}
                            </ol>
                        </section>
                    </div>

                    <aside className="space-y-6">
                        <AdminComplaintActions complaint={{ id: complaint.id, status: complaint.status, priority: complaint.priority }} />
                        <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-extrabold text-[var(--ink)]">Pelapor</h2>
                            <p className="mt-2 text-sm font-semibold text-[var(--ink)]">{complaint.reporter.name ?? "Tanpa nama"}</p>
                            <p className="text-sm text-[var(--muted)]">{complaint.reporter.email ?? "Email tidak tersedia"}</p>
                        </div>
                    </aside>
                </div>
            </div>
        </DashboardShell>
    );
}

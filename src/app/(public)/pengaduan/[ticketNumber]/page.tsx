import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { publicComplaintSelect, toPublicComplaint, PUBLIC_COMPLAINT_STATUSES } from "@/lib/complaint-projection";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

export default async function PublicComplaintDetail({ params }: { params: Promise<{ ticketNumber: string }> }) {
    const { ticketNumber } = await params;
    const complaint = await prisma.complaint.findFirst({
        where: { ticketNumber, status: { in: [...PUBLIC_COMPLAINT_STATUSES] } },
        select: publicComplaintSelect,
    });

    if (!complaint) notFound();

    const publicComplaint = toPublicComplaint(complaint);

    return (
        <div className="min-h-screen bg-[var(--surface)] px-5 py-10 sm:px-8 sm:py-14">
            <div className="mx-auto max-w-3xl">
                <Link href="/pengaduan" className="text-sm font-bold text-[var(--leaf)]">← Kembali ke forum pengaduan</Link>
                <article className="mt-8 rounded-3xl border border-[var(--line)] bg-white p-6 shadow-[0_20px_50px_rgba(20,40,55,0.08)] sm:p-10">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">{publicComplaint.ticketNumber}</p>
                        <div className="flex gap-2">
                            <StatusBadge status={publicComplaint.status} />
                            {publicComplaint.priority && <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[var(--muted)]">{publicComplaint.priority === "PERLU_PERHATIAN" ? "Perlu perhatian" : "Normal"}</span>}
                        </div>
                    </div>
                    <h1 className="mt-3 text-3xl font-extrabold leading-tight text-[var(--ink)] sm:text-4xl">{publicComplaint.title}</h1>
                    <p className="mt-3 text-sm text-[var(--muted)]">{publicComplaint.category} · {new Date(publicComplaint.createdAt).toLocaleDateString("id-ID")}</p>

                    <h2 className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Deskripsi pengaduan</h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--ink)]">{publicComplaint.description}</p>

                    {publicComplaint.officialResponse && (
                        <div className="mt-8 rounded-2xl border-l-4 border-[var(--leaf)] bg-[var(--soft-accent)] p-5">
                            <p className="text-sm font-bold text-[var(--leaf-dark)]">Tanggapan Admin Kelurahan</p>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--ink)]">{publicComplaint.officialResponse}</p>
                        </div>
                    )}

                    <div className="mt-8 flex flex-wrap gap-6 border-t border-[var(--line)] pt-5 text-sm text-[var(--muted)]">
                        {publicComplaint.completedAt && <span>Selesai: {new Date(publicComplaint.completedAt).toLocaleDateString("id-ID")}</span>}
                        {publicComplaint.rejectedAt && <span>Ditolak: {new Date(publicComplaint.rejectedAt).toLocaleDateString("id-ID")}</span>}
                    </div>
                </article>
            </div>
        </div>
    );
}

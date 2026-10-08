"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";

type PublicComplaint = {
    ticketNumber: string;
    title: string;
    category: string;
    description: string;
    status: string;
    priority: string | null;
    createdAt: string;
    completedAt: string | null;
    rejectedAt: string | null;
    officialResponse: string | null;
};

export function PublicComplaintList({ complaints }: { complaints: PublicComplaint[] }) {
    const [statusFilter, setStatusFilter] = useState("ALL");

    const filtered = useMemo(() => {
        if (statusFilter === "ALL") return complaints;
        return complaints.filter((complaint) => complaint.status === statusFilter);
    }, [complaints, statusFilter]);

    return (
        <div>
            <div className="flex items-center justify-between gap-3">
                <p className="text-[13px] font-medium text-[var(--muted)]">{filtered.length} pengaduan</p>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-[13px] font-medium text-[var(--ink)]">
                    <option value="ALL">Semua status</option>
                    <option value="SELESAI">Selesai</option>
                    <option value="DITOLAK">Ditolak</option>
                </select>
            </div>

            <div className="mt-3 space-y-2">
                {filtered.length === 0 && <p className="rounded-xl border border-[var(--line)] bg-white p-5 text-[13px] text-[var(--muted)]">Belum ada pengaduan yang dipublikasikan.</p>}
                {filtered.map((complaint) => (
                    <Link href={`/pengaduan/${complaint.ticketNumber}`} key={complaint.ticketNumber} className="block rounded-xl border border-[var(--line)] bg-white p-5 transition hover:border-[var(--brand)]/30 hover:shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--brand)]">{complaint.ticketNumber}</p>
                                    <span className="text-[var(--line)]">·</span>
                                    <p className="text-[11px] text-[var(--muted)]">{complaint.category}</p>
                                </div>
                                <h2 className="mt-1 text-[15px] font-semibold text-[var(--ink)]">{complaint.title}</h2>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                <StatusBadge status={complaint.status} />
                                {complaint.priority === "PERLU_PERHATIAN" && <span className="rounded-full bg-[var(--gold-soft)] px-2.5 py-0.5 text-[11px] font-semibold text-[#8a5a12]">Perlu perhatian</span>}
                            </div>
                        </div>
                        <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-[var(--muted)]">{complaint.description}</p>
                        <p className="mt-2 text-[11px] text-[var(--muted)]">
                            {complaint.completedAt ? `Selesai ${new Date(complaint.completedAt).toLocaleDateString("id-ID")}` : complaint.rejectedAt ? `Ditolak ${new Date(complaint.rejectedAt).toLocaleDateString("id-ID")}` : `Diajukan ${new Date(complaint.createdAt).toLocaleDateString("id-ID")}`}
                        </p>
                        {complaint.officialResponse && (
                            <div className="mt-3 rounded-lg bg-[var(--surface)] p-3">
                                <p className="text-[11px] font-semibold text-[var(--leaf)]">Tanggapan Admin</p>
                                <p className="mt-1 line-clamp-2 text-[13px] leading-6 text-[var(--muted)]">{complaint.officialResponse}</p>
                            </div>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}

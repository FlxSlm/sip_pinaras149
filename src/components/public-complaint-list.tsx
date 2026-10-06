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
                <p className="text-sm font-semibold text-[var(--muted)]">{filtered.length} pengaduan</p>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)]">
                    <option value="ALL">Semua status</option>
                    <option value="SELESAI">Selesai</option>
                    <option value="DITOLAK">Ditolak</option>
                </select>
            </div>

            <div className="mt-4 space-y-4">
                {filtered.length === 0 && <p className="rounded-xl border border-[var(--line)] bg-white p-6 text-sm text-[var(--muted)]">Belum ada pengaduan yang dipublikasikan.</p>}
                {filtered.map((complaint) => (
                    <Link href={`/pengaduan/${complaint.ticketNumber}`} key={complaint.ticketNumber} className="block rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand)]">{complaint.ticketNumber}</p>
                                <h2 className="mt-1 text-lg font-bold text-[var(--ink)]">{complaint.title}</h2>
                                <p className="mt-1 text-sm text-[var(--muted)]">{complaint.category}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <StatusBadge status={complaint.status} />
                                {complaint.priority && <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[var(--muted)]">{complaint.priority === "PERLU_PERHATIAN" ? "Perlu perhatian" : "Normal"}</span>}
                            </div>
                        </div>
                        <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-[var(--muted)]">{complaint.description}</p>
                        <p className="mt-3 text-xs text-[var(--muted)]">
                            {complaint.completedAt ? `Selesai ${new Date(complaint.completedAt).toLocaleDateString("id-ID")}` : complaint.rejectedAt ? `Ditolak ${new Date(complaint.rejectedAt).toLocaleDateString("id-ID")}` : `Diajukan ${new Date(complaint.createdAt).toLocaleDateString("id-ID")}`}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}

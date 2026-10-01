"use client";

import { useState } from "react";
import Link from "next/link";

type PublicComplaint = {
    ticketNumber: string;
    title: string;
    category: string;
    handlingStatus: string;
    officialResponse: string | null;
    rating: number | null;
    publishedAt: string | null;
    lingkungan: { name: string };
};

const statusLabels: Record<string, string> = {
    SELESAI: "Selesai",
    DALAM_PROSES: "Dalam proses",
    DI_LUAR_KEWENANGAN: "Di luar kewenangan",
};

export function PublicComplaintList({ complaints }: { complaints: PublicComplaint[] }) {
    const [status, setStatus] = useState("SEMUA");
    const [category, setCategory] = useState("SEMUA");
    const categories = [...new Set(complaints.map((complaint) => complaint.category))].sort();
    const filteredComplaints = complaints.filter((complaint) => (status === "SEMUA" || complaint.handlingStatus === status) && (category === "SEMUA" || complaint.category === category));

    return (
        <>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold text-[var(--ink)]">Status
                    <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 font-normal outline-none focus:border-[var(--accent)]">
                        <option value="SEMUA">Semua status</option>
                        {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                </label>
                <label className="text-sm font-semibold text-[var(--ink)]">Kategori
                    <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 font-normal outline-none focus:border-[var(--accent)]">
                        <option value="SEMUA">Semua kategori</option>
                        {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                </label>
            </div>
            <section className="mt-6 space-y-4">
                {filteredComplaints.length === 0 && <p className="rounded-2xl border border-[var(--line)] bg-white p-8 text-sm text-[var(--muted)]">Belum ada pengaduan yang sesuai filter.</p>}
                {filteredComplaints.map((complaint) => (
                    <article key={complaint.ticketNumber} className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[0_12px_30px_rgba(20,40,55,0.06)] sm:p-7">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">{complaint.ticketNumber}</p>
                                <h2 className="mt-2 text-xl font-bold text-[var(--ink)]">{complaint.title}</h2>
                                <p className="mt-2 text-sm text-[var(--muted)]">{complaint.category} · {complaint.lingkungan.name}</p>
                            </div>
                            <span className="rounded-full bg-[var(--soft-accent)] px-3 py-1 text-xs font-bold text-[var(--accent)]">{statusLabels[complaint.handlingStatus] ?? complaint.handlingStatus}</span>
                        </div>
                        {complaint.officialResponse && <p className="mt-5 border-l-2 border-[var(--accent)] pl-4 text-sm leading-6 text-[var(--ink)]"><span className="font-bold">Respon resmi</span><br />{complaint.officialResponse}</p>}
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)]">
                            <span>{complaint.publishedAt ? `Dipublikasikan ${new Date(complaint.publishedAt).toLocaleDateString("id-ID")}` : ""}</span>
                            {complaint.rating !== null && <span className="font-bold text-[var(--gold)]">★ {complaint.rating}/5</span>}
                        </div>
                        <Link href={`/pengaduan/${complaint.ticketNumber}`} className="mt-4 inline-block text-sm font-bold text-[var(--accent)]">Lihat detail →</Link>
                    </article>
                ))}
            </section>
        </>
    );
}
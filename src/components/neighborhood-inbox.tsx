"use client";

import { useState } from "react";

type Complaint = {
    id: string;
    ticketNumber: string;
    title: string;
    category: string;
    description: string;
    handlingStatus: string;
    internalNote: string | null;
    createdAt: string;
    reporter: { name: string | null; email: string | null; phone: string | null };
};

export function NeighborhoodInbox({ initialComplaints }: { initialComplaints: Complaint[] }) {
    const [complaints, setComplaints] = useState(initialComplaints);
    const [message, setMessage] = useState("");
    const [pendingId, setPendingId] = useState("");

    async function act(complaintId: string, action: "VERIFY" | "ADD_NOTE" | "FORWARD", note?: string) {
        setPendingId(complaintId);
        setMessage("");
        const response = await fetch("/api/petugas/lingkungan/pengaduan", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ complaintId, action, note }),
        });
        const result = (await response.json()) as { message?: string };
        setMessage(result.message ?? "Tindakan selesai.");
        if (response.ok) {
            setComplaints((current) => current.map((complaint) => complaint.id !== complaintId ? complaint : {
                ...complaint,
                handlingStatus: action === "VERIFY" ? "DIVERIFIKASI" : action === "FORWARD" ? "DITERUSKAN_KE_LURAH" : complaint.handlingStatus,
                internalNote: action === "ADD_NOTE" ? note ?? complaint.internalNote : complaint.internalNote,
            }));
        }
        setPendingId("");
    }

    return (
        <section className="mt-8 space-y-4">
            {message && <p className="text-sm text-[var(--muted)]" role="status">{message}</p>}
            {complaints.length === 0 && <p className="rounded-lg border border-[var(--line)] bg-white p-6 text-sm text-[var(--muted)]">Belum ada pengaduan di lingkungan ini.</p>}
            {complaints.map((complaint) => (
                <article key={complaint.id} className="rounded-lg border border-[var(--line)] bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{complaint.ticketNumber}</p>
                            <h2 className="mt-2 text-xl font-semibold text-[var(--ink)]">{complaint.title}</h2>
                            <p className="mt-1 text-sm text-[var(--muted)]">{complaint.category} · {complaint.handlingStatus}</p>
                        </div>
                        <time className="text-sm text-[var(--muted)]" dateTime={complaint.createdAt}>{new Date(complaint.createdAt).toLocaleDateString("id-ID")}</time>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[var(--ink)]">{complaint.description}</p>
                    <p className="mt-4 text-sm text-[var(--muted)]">Pelapor: {complaint.reporter.name ?? "Tanpa nama"} · {complaint.reporter.phone ?? complaint.reporter.email ?? "Kontak tidak tersedia"}</p>
                    {complaint.internalNote && <p className="mt-3 rounded-md bg-[var(--surface)] p-3 text-sm text-[var(--muted)]">Catatan internal: {complaint.internalNote}</p>}
                    <div className="mt-5 flex flex-wrap gap-2">
                        {complaint.handlingStatus === "DIAJUKAN" && <button disabled={pendingId === complaint.id} onClick={() => act(complaint.id, "VERIFY")} className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Verifikasi</button>}
                        {complaint.handlingStatus === "DIVERIFIKASI" && <button disabled={pendingId === complaint.id} onClick={() => act(complaint.id, "FORWARD")} className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Teruskan ke Lurah</button>}
                        <button disabled={pendingId === complaint.id} onClick={() => { const note = window.prompt("Catatan internal"); if (note?.trim()) void act(complaint.id, "ADD_NOTE", note.trim()); }} className="rounded-md border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--ink)] disabled:opacity-60">Tambah catatan</button>
                    </div>
                </article>
            ))}
        </section>
    );
}

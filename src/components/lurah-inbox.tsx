"use client";

import { useState } from "react";
import { PublicationControl } from "@/components/publication-control";

type Complaint = {
    id: string;
    ticketNumber: string;
    title: string;
    category: string;
    description: string;
    handlingStatus: string;
    internalNote: string | null;
    officialResponse: string | null;
    publicationStatus: string;
    createdAt: string;
    lingkungan: { name: string; code: string };
    reporter: { name: string | null; email: string | null; phone: string | null };
};

export function LurahInbox({ initialComplaints }: { initialComplaints: Complaint[] }) {
    const [complaints, setComplaints] = useState(initialComplaints);
    const [message, setMessage] = useState("");
    const [pendingId, setPendingId] = useState("");

    async function act(complaintId: string, action: "START" | "RESPOND" | "COMPLETE" | "OUTSIDE_AUTHORITY", response?: string) {
        setPendingId(complaintId);
        setMessage("");
        const result = await fetch("/api/petugas/lurah/pengaduan", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ complaintId, action, response }),
        });
        const payload = (await result.json()) as { message?: string };
        setMessage(payload.message ?? "Tindakan selesai.");
        if (result.ok) {
            setComplaints((current) => current.map((complaint) => complaint.id !== complaintId ? complaint : {
                ...complaint,
                handlingStatus: action === "START" ? "DALAM_PROSES" : action === "COMPLETE" ? "SELESAI" : action === "OUTSIDE_AUTHORITY" ? "DI_LUAR_KEWENANGAN" : complaint.handlingStatus,
                officialResponse: action === "RESPOND" ? response ?? complaint.officialResponse : complaint.officialResponse,
            }));
        }
        setPendingId("");
    }

    function askForResponse(complaint: Complaint, action: "RESPOND" | "COMPLETE") {
        const response = window.prompt(action === "RESPOND" ? "Respon resmi Lurah" : "Respon resmi sebelum menyelesaikan pengaduan", complaint.officialResponse ?? "");
        if (response?.trim()) void act(complaint.id, action, response.trim());
    }

    return (
        <section className="mt-8 space-y-4">
            {message && <p className="text-sm text-[var(--muted)]" role="status">{message}</p>}
            {complaints.length === 0 && <p className="rounded-lg border border-[var(--line)] bg-white p-6 text-sm text-[var(--muted)]">Belum ada pengaduan yang diteruskan ke Lurah.</p>}
            {complaints.map((complaint) => (
                <article key={complaint.id} className="rounded-lg border border-[var(--line)] bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{complaint.ticketNumber} · {complaint.lingkungan.code}</p>
                            <h2 className="mt-2 text-xl font-semibold text-[var(--ink)]">{complaint.title}</h2>
                            <p className="mt-1 text-sm text-[var(--muted)]">{complaint.lingkungan.name} · {complaint.category} · {complaint.handlingStatus}</p>
                        </div>
                        <time className="text-sm text-[var(--muted)]" dateTime={complaint.createdAt}>{new Date(complaint.createdAt).toLocaleDateString("id-ID")}</time>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[var(--ink)]">{complaint.description}</p>
                    <p className="mt-4 text-sm text-[var(--muted)]">Pelapor: {complaint.reporter.name ?? "Tanpa nama"} · {complaint.reporter.phone ?? complaint.reporter.email ?? "Kontak tidak tersedia"}</p>
                    {complaint.internalNote && <p className="mt-3 rounded-md bg-[var(--surface)] p-3 text-sm text-[var(--muted)]">Catatan internal: {complaint.internalNote}</p>}
                    {complaint.officialResponse && <p className="mt-3 rounded-md border border-[var(--line)] p-3 text-sm text-[var(--ink)]">Respon resmi: {complaint.officialResponse}</p>}
                    <div className="mt-5 flex flex-wrap gap-2">
                        {complaint.handlingStatus === "DITERUSKAN_KE_LURAH" && <><button disabled={pendingId === complaint.id} onClick={() => void act(complaint.id, "START")} className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Mulai proses</button><button disabled={pendingId === complaint.id} onClick={() => void act(complaint.id, "OUTSIDE_AUTHORITY")} className="rounded-md border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--ink)] disabled:opacity-60">Di luar kewenangan</button></>}
                        {complaint.handlingStatus === "DALAM_PROSES" && <button disabled={pendingId === complaint.id} onClick={() => askForResponse(complaint, "COMPLETE")} className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Selesaikan</button>}
                        {(complaint.handlingStatus === "DITERUSKAN_KE_LURAH" || complaint.handlingStatus === "DALAM_PROSES") && <button disabled={pendingId === complaint.id} onClick={() => askForResponse(complaint, "RESPOND")} className="rounded-md border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--ink)] disabled:opacity-60">Tambah respon resmi</button>}
                        {complaint.handlingStatus === "SELESAI" && <PublicationControl complaintId={complaint.id} published={complaint.publicationStatus === "PUBLISHED"} />}
                    </div>
                </article>
            ))}
        </section>
    );
}

"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { TextPromptDialog } from "@/components/text-prompt-dialog";

type Complaint = {
    id: string;
    ticketNumber: string;
    title: string;
    category: string;
    description: string;
    status: string;
    priority: string | null;
    createdAt: string;
};

type Prompt = { complaintId: string; action: "COMPLETE" | "REJECT" | "RESPOND" } | null;

const priorityLabel: Record<string, string> = {
    NORMAL: "Normal",
    PERLU_PERHATIAN: "Perlu perhatian",
};

function PriorityBadge({ priority }: { priority: string | null }) {
    if (!priority) {
        return <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[var(--muted)]">Belum ada prioritas</span>;
    }
    const tone = priority === "PERLU_PERHATIAN" ? "bg-[#fbe9e7] text-[var(--danger)]" : "bg-[#e7f0fa] text-[var(--brand-dark)]";
    return <span className={`rounded-full px-3 py-1 text-xs font-bold ${tone}`}>{priorityLabel[priority] ?? priority}</span>;
}

export function AdminInbox({ initialComplaints }: { initialComplaints: Complaint[] }) {
    const [complaints, setComplaints] = useState(initialComplaints);
    const [message, setMessage] = useState("");
    const [pendingId, setPendingId] = useState("");
    const [prompt, setPrompt] = useState<Prompt>(null);
    const [priorityById, setPriorityById] = useState<Record<string, string>>({});

    async function act(complaintId: string, action: string, extra?: { priority?: string; note?: string }) {
        setPendingId(complaintId);
        setMessage("");
        const response = await fetch("/api/admin/pengaduan", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ complaintId, action, ...extra }),
        });
        const result = (await response.json()) as { message?: string };
        setMessage(result.message ?? (response.ok ? "Tindakan tersimpan." : "Tindakan gagal."));
        if (response.ok) {
            setComplaints((current) =>
                current.map((complaint) => {
                    if (complaint.id !== complaintId) return complaint;
                    if (action === "OPEN") return { ...complaint, status: "DIPROSES", priority: extra?.priority ?? null };
                    if (action === "COMPLETE") return { ...complaint, status: "SELESAI" };
                    if (action === "REJECT") return { ...complaint, status: "DITOLAK" };
                    return complaint;
                }),
            );
        }
        setPendingId("");
    }

    const toDo = complaints.filter((complaint) => complaint.status === "MENUNGGU" || complaint.status === "DIPROSES");
    const done = complaints.filter((complaint) => complaint.status === "SELESAI" || complaint.status === "DITOLAK");

    return (
        <div className="space-y-6">
            {message && <p className="text-sm text-[var(--muted)]" role="status">{message}</p>}

            <section>
                <h2 className="text-lg font-extrabold text-[var(--ink)]">Perlu ditindaklanjuti</h2>
                {toDo.length === 0 ? (
                    <p className="mt-3 rounded-xl bg-white p-6 text-sm text-[var(--muted)]">Tidak ada pengaduan yang perlu ditindaklanjuti.</p>
                ) : (
                    <div className="mt-3 space-y-3">
                        {toDo.map((complaint) => (
                            <div key={complaint.id} className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand)]">{complaint.ticketNumber}</p>
                                        <h3 className="mt-1 font-bold text-[var(--ink)]">{complaint.title}</h3>
                                        <p className="mt-1 text-sm text-[var(--muted)]">{complaint.category} · {new Date(complaint.createdAt).toLocaleDateString("id-ID")}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <StatusBadge status={complaint.status} />
                                        <PriorityBadge priority={complaint.priority} />
                                    </div>
                                </div>
                                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--ink)]">{complaint.description}</p>
                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    {complaint.status === "MENUNGGU" && (
                                        <>
                                            <select
                                                value={priorityById[complaint.id] ?? "NORMAL"}
                                                onChange={(event) => setPriorityById((current) => ({ ...current, [complaint.id]: event.target.value }))}
                                                className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--ink)]"
                                            >
                                                <option value="NORMAL">Normal</option>
                                                <option value="PERLU_PERHATIAN">Perlu perhatian</option>
                                            </select>
                                            <button disabled={pendingId === complaint.id} onClick={() => act(complaint.id, "OPEN", { priority: priorityById[complaint.id] ?? "NORMAL" })} className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                                                Proses
                                            </button>
                                        </>
                                    )}
                                    {complaint.status === "DIPROSES" && (
                                        <button disabled={pendingId === complaint.id} onClick={() => setPrompt({ complaintId: complaint.id, action: "COMPLETE" })} className="rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                                            Selesaikan
                                        </button>
                                    )}
                                    {complaint.status === "MENUNGGU" && (
                                        <button disabled={pendingId === complaint.id} onClick={() => setPrompt({ complaintId: complaint.id, action: "COMPLETE" })} className="rounded-lg border border-[var(--leaf)] px-4 py-2 text-sm font-bold text-[var(--leaf-dark)] disabled:opacity-60">
                                            Selesaikan langsung
                                        </button>
                                    )}
                                    <button disabled={pendingId === complaint.id} onClick={() => setPrompt({ complaintId: complaint.id, action: "REJECT" })} className="rounded-lg border border-[var(--danger)] px-4 py-2 text-sm font-bold text-[var(--danger)] disabled:opacity-60">
                                        Tolak
                                    </button>
                                    <button disabled={pendingId === complaint.id} onClick={() => setPrompt({ complaintId: complaint.id, action: "RESPOND" })} className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-bold text-[var(--ink)] disabled:opacity-60">
                                        Tanggapi
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h2 className="text-lg font-extrabold text-[var(--ink)]">Sudah selesai</h2>
                {done.length === 0 ? (
                    <p className="mt-3 rounded-xl bg-white p-6 text-sm text-[var(--muted)]">Belum ada pengaduan yang selesai atau ditolak.</p>
                ) : (
                    <div className="mt-3 divide-y divide-[var(--line)] rounded-2xl border border-[var(--line)] bg-white shadow-sm">
                        {done.map((complaint) => (
                            <div key={complaint.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                                <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand)]">{complaint.ticketNumber}</p>
                                    <p className="truncate font-semibold text-[var(--ink)]">{complaint.title}</p>
                                </div>
                                <div className="flex gap-2">
                                    <StatusBadge status={complaint.status} />
                                    <PriorityBadge priority={complaint.priority} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {prompt && (
                <TextPromptDialog
                    title={prompt.action === "REJECT" ? "Alasan penolakan" : prompt.action === "COMPLETE" ? "Catatan penyelesaian (opsional)" : "Tanggapan untuk warga"}
                    onCancel={() => setPrompt(null)}
                    onConfirm={(note) => {
                        const target = prompt;
                        setPrompt(null);
                        void act(target.complaintId, target.action, { note });
                    }}
                />
            )}
        </div>
    );
}

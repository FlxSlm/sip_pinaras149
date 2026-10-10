"use client";

import { useState } from "react";
import { TextPromptDialog } from "@/components/text-prompt-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";

type Props = {
    complaint: { id: string; status: string; priority: string | null };
};

type Prompt = { action: "COMPLETE" | "REJECT" | "RESPOND" } | null;

export function AdminComplaintActions({ complaint }: Props) {
    const [pending, setPending] = useState(false);
    const [message, setMessage] = useState("");
    const [priority, setPriority] = useState("NORMAL");
    const [prompt, setPrompt] = useState<Prompt>(null);
    const [confirmation, setConfirmation] = useState<{ action: string; note?: string; priority?: string } | null>(null);

    async function act(action: string, extra?: { priority?: string; note?: string }) {
        setPending(true);
        setMessage("");
        try {
        const response = await fetch("/api/admin/pengaduan", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ complaintId: complaint.id, action, ...extra }),
        });
        const result = (await response.json()) as { message?: string };
        if (response.ok) {
            window.location.reload();
            return;
        }
        setMessage(result.message ?? "Tindakan gagal.");
        } catch { setMessage("Tindakan belum berhasil. Periksa koneksi lalu coba kembali."); }
        setPending(false);
    }

    const canProcess = complaint.status === "MENUNGGU";
    const canFinish = complaint.status === "MENUNGGU" || complaint.status === "DIPROSES";

    return (
        <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-[var(--ink)]">Tindakan</h2>
            {message && <p className="mt-3 text-sm text-[var(--danger)]" role="status">{message}</p>}

            {canProcess && (
                <div className="mt-4">
                    <p className="text-sm font-semibold text-[var(--muted)]">Tentukan prioritas lalu proses</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        <select value={priority} onChange={(event) => setPriority(event.target.value)} className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--ink)]">
                            <option value="NORMAL">Normal</option>
                            <option value="PERLU_PERHATIAN">Perlu perhatian</option>
                        </select>
                        <button type="button" disabled={pending} onClick={() => setConfirmation({ action: "OPEN", priority })} className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                            Proses
                        </button>
                    </div>
                </div>
            )}

            {canFinish && (
                <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" disabled={pending} onClick={() => setPrompt({ action: "COMPLETE" })} className="rounded-lg bg-[var(--leaf)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                        Selesaikan
                    </button>
                    <button type="button" disabled={pending} onClick={() => setPrompt({ action: "REJECT" })} className="rounded-lg border border-[var(--danger)] px-4 py-2 text-sm font-bold text-[var(--danger)] disabled:opacity-60">
                        Tolak
                    </button>
                    <button type="button" disabled={pending} onClick={() => setPrompt({ action: "RESPOND" })} className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-bold text-[var(--ink)] disabled:opacity-60">
                        Tanggapi
                    </button>
                </div>
            )}

            {!canProcess && !canFinish && <p className="mt-4 text-sm text-[var(--muted)]">Pengaduan ini sudah selesai atau ditolak.</p>}

            {prompt && (
                <TextPromptDialog
                    title={prompt.action === "REJECT" ? "Alasan penolakan" : prompt.action === "COMPLETE" ? "Catatan penyelesaian (opsional)" : "Tanggapan untuk warga"}
                    onCancel={() => setPrompt(null)}
                    onConfirm={(note) => {
                        const target = prompt;
                        setPrompt(null);
                        setConfirmation({ action: target.action, note });
                    }}
                />
            )}
            {confirmation && <ConfirmDialog title={confirmation.action === "REJECT" ? "Tolak pengaduan?" : confirmation.action === "COMPLETE" ? "Selesaikan pengaduan?" : confirmation.action === "OPEN" ? "Mulai proses pengaduan?" : "Kirim tanggapan?"} description={confirmation.note || `Prioritas: ${confirmation.priority === "PERLU_PERHATIAN" ? "Perlu perhatian" : "Normal"}. Perubahan ini dicatat pada riwayat pengaduan.`} danger={confirmation.action === "REJECT"} confirmLabel="Ya, lanjutkan" onCancel={() => setConfirmation(null)} onConfirm={() => { const target = confirmation; setConfirmation(null); void act(target.action, { note: target.note, priority: target.priority }); }} />}
        </div>
    );
}

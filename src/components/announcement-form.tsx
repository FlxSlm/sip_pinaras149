"use client";

import { useState } from "react";

export function AnnouncementForm() {
    const [message, setMessage] = useState("");
    const [pending, setPending] = useState(false);
    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault(); setPending(true); setMessage("");
        const form = new FormData(event.currentTarget);
        try {
            const response = await fetch("/api/pengumuman", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: form.get("title"), content: form.get("content"), isPinned: form.get("isPinned") === "on" }) });
            const result = await response.json() as { message?: string; announcement?: { title: string } };
            setMessage(response.ok ? "Pengumuman diterbitkan." : result.message ?? "Pengumuman tidak dapat dibuat.");
            if (response.ok) event.currentTarget.reset();
        } catch { setMessage("Pengumuman tidak dapat dibuat."); } finally { setPending(false); }
    }
    return <form onSubmit={submit} className="mt-6 space-y-3 rounded-xl border border-[var(--line)] bg-white p-5 shadow-sm"><h2 className="text-xl font-semibold">Terbitkan pengumuman</h2><input name="title" required maxLength={160} placeholder="Judul pengumuman" className="w-full rounded-md border border-[var(--line)] px-3 py-3" /><textarea name="content" required rows={5} placeholder="Isi pengumuman" className="w-full rounded-md border border-[var(--line)] px-3 py-3" /><label className="flex items-center gap-2 text-sm"><input name="isPinned" type="checkbox" /> Sematkan sebagai pengumuman penting</label>{message && <p role="status" className="text-sm text-[var(--muted)]">{message}</p>}<button disabled={pending} className="rounded-md bg-[var(--accent)] px-4 py-3 font-semibold text-white disabled:opacity-60">{pending ? "Menerbitkan..." : "Terbitkan"}</button></form>;
}

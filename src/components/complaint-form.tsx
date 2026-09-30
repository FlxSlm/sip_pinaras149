"use client";

import { FormEvent, useState } from "react";

type Environment = {
    id: string;
    name: string;
};

export function ComplaintForm({ environments }: { environments: Environment[] }) {
    const [message, setMessage] = useState("");
    const [pending, setPending] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setPending(true);
        setMessage("");

        const response = await fetch("/api/warga/pengaduan", {
            method: "POST",
            body: new FormData(event.currentTarget),
        });
        const result = (await response.json()) as { message?: string; complaint?: { ticketNumber: string } };
        setMessage(result.complaint ? `${result.message} Nomor tiket: ${result.complaint.ticketNumber}` : result.message ?? "Pengaduan tidak dapat dikirim.");
        if (response.ok) event.currentTarget.reset();
        setPending(false);
    }

    return (
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <div>
                <label className="block text-sm font-medium text-[var(--ink)]" htmlFor="lingkunganId">Lingkungan</label>
                <select id="lingkunganId" name="lingkunganId" required className="mt-1 w-full rounded-md border border-[var(--line)] px-3 py-3">
                    <option value="">Pilih lingkungan</option>
                    {environments.map((environment) => <option key={environment.id} value={environment.id}>{environment.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-[var(--ink)]" htmlFor="title">Judul pengaduan</label>
                <input id="title" name="title" required minLength={5} maxLength={120} className="mt-1 w-full rounded-md border border-[var(--line)] px-3 py-3" />
            </div>
            <div>
                <label className="block text-sm font-medium text-[var(--ink)]" htmlFor="category">Kategori</label>
                <input id="category" name="category" required maxLength={60} placeholder="Contoh: Infrastruktur" className="mt-1 w-full rounded-md border border-[var(--line)] px-3 py-3" />
            </div>
            <div>
                <label className="block text-sm font-medium text-[var(--ink)]" htmlFor="description">Deskripsi</label>
                <textarea id="description" name="description" required minLength={20} maxLength={5000} rows={6} className="mt-1 w-full rounded-md border border-[var(--line)] px-3 py-3" />
            </div>
            <div>
                <label className="block text-sm font-medium text-[var(--ink)]" htmlFor="evidence">Foto bukti (opsional, maksimal 5 MB)</label>
                <input id="evidence" name="evidence" type="file" accept="image/jpeg,image/png,image/webp" className="mt-1 block w-full text-sm" />
            </div>
            {message && <p className="text-sm text-[var(--muted)]" role="status">{message}</p>}
            <button type="submit" disabled={pending} className="rounded-md bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
                {pending ? "Mengirim..." : "Kirim pengaduan"}
            </button>
        </form>
    );
}

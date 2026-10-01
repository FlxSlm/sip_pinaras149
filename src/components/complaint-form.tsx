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
        const form = event.currentTarget;

        try {
            const response = await fetch("/api/warga/pengaduan", {
                method: "POST",
                body: new FormData(form),
            });
            const result = (await response.json()) as { message?: string; complaint?: { ticketNumber: string } };
            setMessage(result.complaint ? `${result.message} Nomor tiket: ${result.complaint.ticketNumber}` : result.message ?? "Pengaduan tidak dapat dikirim.");
            if (response.ok) form.reset();
        } catch {
            setMessage("Pengaduan tidak dapat dikirim. Periksa koneksi lalu coba lagi.");
        } finally {
            setPending(false);
        }
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
                <select id="category" name="category" required className="mt-1 w-full rounded-md border border-[var(--line)] px-3 py-3">
                    <option value="">Pilih kategori</option>
                    <option value="Infrastruktur">Infrastruktur</option>
                    <option value="Kebersihan">Kebersihan</option>
                    <option value="Keamanan">Keamanan</option>
                    <option value="Pelayanan publik">Pelayanan publik</option>
                    <option value="Lingkungan">Lingkungan</option>
                    <option value="Sosial">Sosial</option>
                    <option value="Lainnya">Lainnya</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-[var(--ink)]" htmlFor="description">Deskripsi</label>
                <textarea id="description" name="description" required maxLength={5000} rows={6} className="mt-1 w-full rounded-md border border-[var(--line)] px-3 py-3" />
            </div>
            <div>
                <label className="block text-sm font-medium text-[var(--ink)]" htmlFor="evidence">Foto bukti (opsional, maksimal 5 MB)</label>
                <input id="evidence" name="evidence" type="file" multiple accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full cursor-pointer rounded-md border border-[var(--line)] bg-white text-sm file:mr-3 file:border-0 file:bg-[var(--ink)] file:px-4 file:py-3 file:font-semibold file:text-white hover:file:bg-[var(--accent)]" />
            </div>
            {message && <p className="text-sm text-[var(--muted)]" role="status">{message}</p>}
            <button type="submit" disabled={pending} className="rounded-md bg-[var(--ink)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
                {pending ? "Mengirim..." : "Kirim pengaduan"}
            </button>
        </form>
    );
}

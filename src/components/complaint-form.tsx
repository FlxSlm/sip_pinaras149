"use client";

import { FormEvent, useState } from "react";

export function ComplaintForm() {
    const [message, setMessage] = useState("");
    const [pending, setPending] = useState(false);
    const [fileNames, setFileNames] = useState<string[]>([]);

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
                <label className="block text-sm font-medium text-[var(--ink)]" htmlFor="title">Judul pengaduan</label>
                <input id="title" name="title" required minLength={5} maxLength={120} placeholder="Contoh: Jalan rusak di depan gang" className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-3 text-[var(--ink)] outline-none focus:border-[var(--brand)]" />
            </div>
            <div>
                <label className="block text-sm font-medium text-[var(--ink)]" htmlFor="category">Kategori</label>
                <select id="category" name="category" required className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-3 text-[var(--ink)] outline-none focus:border-[var(--brand)]">
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
                <label className="block text-sm font-medium text-[var(--ink)]" htmlFor="location">Lokasi kejadian (opsional)</label>
                <input id="location" name="location" maxLength={200} placeholder="Contoh: Jl. Melati, dekat posyandu" className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-3 text-[var(--ink)] outline-none focus:border-[var(--brand)]" />
            </div>
            <div>
                <label className="block text-sm font-medium text-[var(--ink)]" htmlFor="description">Deskripsi</label>
                <textarea id="description" name="description" required maxLength={5000} rows={6} placeholder="Jelaskan permasalahan Anda secara jelas." className="mt-1 w-full rounded-lg border border-[var(--line)] px-3 py-3 text-[var(--ink)] outline-none focus:border-[var(--brand)]" />
            </div>
            <div>
                <label className="block text-sm font-medium text-[var(--ink)]" htmlFor="evidence">Foto bukti (opsional, maksimal 5 MB)</label>
                <label htmlFor="evidence" className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#9bb8d5] bg-[#f5f9ff] px-5 py-7 text-center hover:border-[var(--brand)] hover:bg-white">
                    <span className="text-2xl text-[var(--brand)]">＋</span>
                    <span className="mt-2 text-sm font-semibold text-[var(--ink)]">Tarik foto ke sini atau pilih file</span>
                    <span className="mt-1 text-xs text-[var(--muted)]">JPG, PNG, atau WEBP · maksimal 5 MB per file</span>
                    {fileNames.length > 0 && <span className="mt-3 text-xs font-semibold text-[var(--brand)]">{fileNames.join(", ")}</span>}
                </label>
                <input id="evidence" name="evidence" type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => setFileNames(Array.from(event.target.files ?? []).map((file) => file.name))} />
            </div>
            {message && <p className="text-sm text-[var(--muted)]" role="status">{message}</p>}
            <button type="submit" disabled={pending} className="rounded-lg bg-[var(--brand)] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
                {pending ? "Mengirim..." : "Kirim pengaduan"}
            </button>
        </form>
    );
}

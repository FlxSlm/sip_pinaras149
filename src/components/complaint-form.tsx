"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Icon } from "@/components/ui/icon";
import { mergeEvidenceFiles } from "@/lib/evidence-files";

function FilePreview({ file }: { file: File }) {
    const ref = useRef<HTMLImageElement>(null);
    useEffect(() => {
        const url = URL.createObjectURL(file);
        if (ref.current) ref.current.src = url;
        return () => URL.revokeObjectURL(url);
    }, [file]);
    // eslint-disable-next-line @next/next/no-img-element
    return <img ref={ref} alt={file.name} className="size-14 shrink-0 rounded-lg object-cover" />;
}

export function ComplaintForm() {
    const [message, setMessage] = useState("");
    const [pending, setPending] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [fileError, setFileError] = useState("");
    const [dragging, setDragging] = useState(false);
    const [submission, setSubmission] = useState<FormData | null>(null);
    const input = useRef<HTMLInputElement>(null);
    const form = useRef<HTMLFormElement>(null);
    const depth = useRef(0);

    function addFiles(incoming: File[]) {
        const result = mergeEvidenceFiles(files, incoming);
        setFiles(result.files);
        setFileError(result.errors.join(" "));
    }
    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const body = new FormData(event.currentTarget);
        files.forEach((file) => body.append("evidence", file));
        setSubmission(body);
    }
    async function send() {
        if (!submission || pending) return;
        const body = submission;
        setSubmission(null);
        setPending(true);
        setMessage("");
        try {
            const response = await fetch("/api/warga/pengaduan", { method: "POST", body });
            const result = await response.json() as { message?: string; complaint?: { ticketNumber: string } };
            setMessage(result.complaint ? result.message + " Nomor tiket: " + result.complaint.ticketNumber : result.message ?? "Pengaduan tidak dapat dikirim.");
            if (response.ok) { form.current?.reset(); setFiles([]); setFileError(""); }
        } catch { setMessage("Pengaduan tidak dapat dikirim. Periksa koneksi lalu coba lagi."); }
        finally { setPending(false); }
    }

    return <form ref={form} className="mt-5 space-y-5" onSubmit={handleSubmit}>
        <fieldset disabled={pending} className="space-y-5">
            <label className="block text-sm font-semibold" htmlFor="title">Judul pengaduan
                <input id="title" name="title" required minLength={5} maxLength={120} placeholder="Ringkas permasalahan yang ingin disampaikan" className="mt-2 w-full" />
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-semibold" htmlFor="category">Kategori
                    <select id="category" name="category" required className="mt-2 w-full"><option value="">Pilih kategori</option>{["Infrastruktur", "Kebersihan", "Keamanan", "Pelayanan publik", "Lingkungan", "Sosial", "Lainnya"].map((category) => <option key={category}>{category}</option>)}</select>
                </label>
                <label className="block text-sm font-semibold" htmlFor="location">Lokasi kejadian <span className="font-normal text-[var(--muted)]">(opsional)</span>
                    <input id="location" name="location" maxLength={200} placeholder="Alamat atau patokan lokasi" className="mt-2 w-full" />
                </label>
            </div>
            <label className="block text-sm font-semibold" htmlFor="description">Deskripsi
                <textarea id="description" name="description" required maxLength={5000} rows={5} placeholder="Ceritakan kondisi, waktu kejadian, dan dampaknya." className="mt-2 w-full" />
            </label>
            <div>
                <p className="text-sm font-semibold">Bukti foto <span className="font-normal text-[var(--muted)]">(opsional)</span></p>
                <div className={"mt-2 rounded-xl border-2 border-dashed p-5 text-center transition " + (dragging ? "border-[var(--brand)] bg-[var(--brand-soft)]" : "border-[var(--line)] bg-[var(--surface)]")}
                    onDragEnter={(event) => { event.preventDefault(); depth.current++; setDragging(true); }}
                    onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; }}
                    onDragLeave={(event) => { event.preventDefault(); depth.current--; if (depth.current <= 0) setDragging(false); }}
                    onDrop={(event) => { event.preventDefault(); depth.current = 0; setDragging(false); if (!pending) addFiles(Array.from(event.dataTransfer.files)); }}>
                    <span className="mx-auto grid size-12 place-items-center rounded-xl bg-white text-[var(--brand)]"><Icon name="upload" className="size-6" /></span>
                    <p className="mt-3 font-semibold">{dragging ? "Lepaskan foto untuk menambahkan" : "Tarik dan letakkan foto di sini"}</p>
                    <p id="evidence-help" className="mt-1 text-sm text-[var(--muted)]">JPG, PNG, atau WEBP · maksimal 5 MB per foto</p>
                    <button type="button" onClick={() => input.current?.click()} className="ui-button ui-button-secondary mt-3">Pilih foto</button>
                    <input ref={input} id="evidence" aria-label="Pilih foto bukti" aria-describedby="evidence-help" type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { addFiles(Array.from(event.target.files ?? [])); event.target.value = ""; }} />
                </div>
                {fileError && <p role="alert" className="mt-2 text-sm text-[var(--danger)]">{fileError}</p>}
                {files.length > 0 && <ul className="mt-3 grid gap-2 sm:grid-cols-2">{files.map((file, i) => <li key={file.name + file.lastModified} className="flex min-w-0 items-center gap-3 rounded-xl border border-[var(--line)] bg-white p-3">
                    <FilePreview file={file} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{file.name}</p><p className="text-xs text-[var(--muted)]">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
                    <button type="button" aria-label={"Hapus pilihan " + file.name} onClick={() => setFiles(files.filter((_, index) => index !== i))} className="grid size-10 shrink-0 place-items-center rounded-lg text-[var(--danger)] hover:bg-[var(--danger-soft)]"><Icon name="close" /></button>
                </li>)}</ul>}
                <p className="mt-2 text-xs text-[var(--muted)]">Bukti hanya dapat dilihat oleh Anda dan admin yang menangani pengaduan.</p>
            </div>
            {message && <p className="rounded-xl bg-[var(--surface)] p-3 text-sm" role="status">{message}</p>}
            <button type="submit" disabled={pending} className="ui-button ui-button-primary">{pending ? "Mengirim..." : "Kirim pengaduan"}</button>
        </fieldset>
        {submission && <ConfirmDialog title="Kirim pengaduan ini?" description={String(submission.get("title")) + ". Pastikan informasi dan bukti yang Anda lampirkan sudah benar."} confirmLabel="Ya, kirim pengaduan" onCancel={() => setSubmission(null)} onConfirm={() => void send()} />}
    </form>;
}

"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useId, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/primitives";
import { Icon } from "@/components/ui/icon";

type Announcement = { id: string; slug: string; title: string; content: string; mediaType: string; hasMedia: boolean; isPinned: boolean; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; publishedAt: string | null; createdAt: string };
type Confirmation = { title: string; description: string; danger?: boolean; run: () => Promise<void> };
const labels = { DRAFT: "Draft", PUBLISHED: "Terbit", ARCHIVED: "Arsip" };

export function AnnouncementManager() {
    const [items, setItems] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [pending, setPending] = useState(false);
    const [filter, setFilter] = useState("ALL");
    const [query, setQuery] = useState("");
    const [editor, setEditor] = useState<{ item: Announcement | null } | null>(null);
    const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
    const [mediaType, setMediaType] = useState("TEXT");
    const file = useRef<HTMLInputElement>(null);
    const id = useId();

    async function refresh() {
        const response = await fetch("/api/admin/pengumuman", { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load");
        const result = await response.json();
        setItems(Array.isArray(result) ? result : []);
    }
    useEffect(() => {
        let active = true;
        void fetch("/api/admin/pengumuman", { cache: "no-store" }).then(async (response) => {
            if (!response.ok) throw new Error("Unable to load");
            const result = await response.json();
            if (active) setItems(Array.isArray(result) ? result : []);
        }).catch(() => { if (active) setMessage("Daftar pengumuman belum dapat dimuat. Coba kembali."); }).finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    function openEditor(item: Announcement | null) { setMediaType(item?.mediaType ?? "TEXT"); setEditor({ item }); setMessage(""); }
    async function mutate(method: string, body: BodyInit, isJson = false) {
        setPending(true); setMessage("");
        try {
            const response = await fetch("/api/admin/pengumuman", { method, body, ...(isJson ? { headers: { "Content-Type": "application/json" } } : {}) });
            const result = await response.json() as { message?: string };
            setMessage(result.message ?? (response.ok ? "Pengumuman disimpan." : "Tindakan belum berhasil."));
            if (response.ok) { setEditor(null); await refresh(); }
        } catch { setMessage("Tindakan belum berhasil. Periksa koneksi dan coba kembali."); }
        finally { setPending(false); }
    }
    function requestSave(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const body = new FormData(event.currentTarget);
        body.set("mediaType", mediaType);
        if (editor?.item) body.set("id", editor.item.id);
        const uploaded = body.get("media");
        if (uploaded instanceof File && uploaded.size === 0) body.delete("media");
        const status = String(body.get("status"));
        setConfirmation({
            title: status === "PUBLISHED" ? "Simpan dan terbitkan pengumuman?" : "Simpan pengumuman ini?",
            description: status === "PUBLISHED" ? "Isi dan lampiran pengumuman akan dapat dibaca publik." : "Pengumuman disimpan untuk pengelolaan admin.",
            run: () => mutate(editor?.item ? "PATCH" : "POST", body),
        });
    }
    function requestAction(item: Announcement, action: "publish" | "unpublish" | "delete") {
        setConfirmation({ title: action === "delete" ? "Hapus pengumuman?" : action === "publish" ? "Terbitkan pengumuman?" : "Kembalikan ke draft?", description: item.title + (action === "delete" ? " akan dihapus permanen." : action === "publish" ? " akan dapat dibaca publik." : " tidak lagi dapat dibaca publik."), danger: action !== "publish", run: () => mutate(action === "delete" ? "DELETE" : "PATCH", JSON.stringify({ id: item.id, action }), true) });
    }
    const filtered = items.filter((item) => (filter === "ALL" || item.status === filter) && item.title.toLocaleLowerCase("id-ID").includes(query.trim().toLocaleLowerCase("id-ID")));
    return <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-[var(--muted)]">{items.length} pengumuman · {items.filter((item) => item.status === "PUBLISHED").length} terbit</p><Button disabled={pending} onClick={() => openEditor(null)}><Icon name="plus" />Buat pengumuman</Button></div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]"><label><span className="sr-only">Cari pengumuman admin</span><input type="search" placeholder="Cari judul pengumuman..." value={query} onChange={(event) => setQuery(event.target.value)} className="w-full" /></label><label><span className="sr-only">Status publikasi</span><select value={filter} onChange={(event) => setFilter(event.target.value)} className="w-full"><option value="ALL">Semua status</option><option value="PUBLISHED">Terbit</option><option value="DRAFT">Draft</option><option value="ARCHIVED">Arsip</option></select></label></div>
        {message && <p role="status" className="rounded-xl border border-[var(--line)] bg-white p-4 text-sm">{message}</p>}
        {loading ? <p role="status" className="rounded-xl bg-white p-5">Memuat pengumuman...</p> : filtered.length ? <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-white">{filtered.map((item) => <article key={item.id} className="border-b border-[var(--line)] p-5 last:border-b-0">
            <div className="flex flex-wrap gap-2 text-xs"><span className={"rounded px-2 py-1 font-semibold " + (item.status === "PUBLISHED" ? "ui-tone-done" : "ui-tone-progress")}>{labels[item.status]}</span><span className="rounded bg-[var(--surface)] px-2 py-1">{item.mediaType === "TEXT" ? "Teks" : item.mediaType}</span>{item.isPinned && <span className="rounded px-2 py-1 ui-tone-waiting">Penting</span>}</div>
            <h2 className="mt-3 text-lg font-semibold"><Link href={"/admin/pengumuman/" + item.id} className="hover:underline">{item.title}</Link></h2><p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{item.content}</p><p className="mt-2 text-xs text-[var(--muted)]">{new Date(item.publishedAt ?? item.createdAt).toLocaleDateString("id-ID", { timeZone: "Asia/Makassar" })}</p>
            <div className="mt-4 flex flex-wrap gap-2"><Link href={"/admin/pengumuman/" + item.id} className="ui-button ui-button-secondary">Lihat detail</Link><Button variant="secondary" disabled={pending} onClick={() => openEditor(item)}>Edit</Button>{item.status !== "PUBLISHED" ? <Button variant="success" disabled={pending} onClick={() => requestAction(item, "publish")}>Terbitkan</Button> : <Button variant="secondary" disabled={pending} onClick={() => requestAction(item, "unpublish")}>Jadikan draft</Button>}<Button variant="ghost" disabled={pending} onClick={() => requestAction(item, "delete")} className="text-[var(--danger)]">Hapus</Button></div>
        </article>)}</div> : <div className="rounded-xl border border-dashed border-[var(--line)] bg-white p-8 text-center"><Icon name="announcement" className="mx-auto size-10 text-[var(--brand)]" /><h2 className="mt-3 text-lg font-semibold">{items.length ? "Tidak ada hasil yang sesuai" : "Belum ada pengumuman"}</h2><p className="mt-2 text-sm text-[var(--muted)]">{items.length ? "Ubah kata kunci atau status yang dipilih." : "Buat informasi teks, unggah PDF, atau bagikan video untuk warga."}</p></div>}
        {editor && <Dialog wide labelledBy={id} onClose={() => { if (!pending) setConfirmation({ title: "Tutup editor?", description: "Perubahan yang belum disimpan akan dibuang.", run: async () => { setEditor(null); } }); }}>
            <div className="mb-5 flex items-start justify-between gap-3"><div><h2 id={id} className="text-2xl font-semibold">{editor.item ? "Edit pengumuman" : "Buat pengumuman"}</h2><p className="mt-1 text-sm text-[var(--muted)]">Teks dan lampiran ditampilkan sesuai status publikasinya.</p></div><Button disabled={pending} variant="secondary" aria-label="Tutup editor" onClick={() => setConfirmation({ title: "Tutup editor?", description: "Perubahan yang belum disimpan akan dibuang.", run: async () => { setEditor(null); } })}><Icon name="close" /></Button></div>
            <form key={editor.item?.id ?? "new"} className="grid gap-5" onSubmit={requestSave}>
                <label className="text-sm font-semibold">Judul<input autoFocus name="title" defaultValue={editor.item?.title ?? ""} required minLength={3} maxLength={160} className="mt-2 w-full" /></label>
                <label className="text-sm font-semibold">Isi pengumuman<textarea name="content" defaultValue={editor.item?.content ?? ""} required maxLength={20000} rows={7} className="mt-2 w-full" /></label>
                <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Jenis media<select value={mediaType} onChange={(event) => { setMediaType(event.target.value); if (file.current) file.current.value = ""; }} className="mt-2 w-full"><option value="TEXT">Teks</option><option value="PDF">PDF</option><option value="VIDEO">Video</option></select></label><label className="text-sm font-semibold">Status publikasi<select name="status" defaultValue={editor.item?.status ?? "DRAFT"} className="mt-2 w-full"><option value="DRAFT">Draft</option><option value="PUBLISHED">Terbit</option>{editor.item?.status === "ARCHIVED" && <option value="ARCHIVED">Arsip</option>}</select></label></div>
                {mediaType !== "TEXT" && <label className="text-sm font-semibold">Lampiran {editor.item?.hasMedia && editor.item.mediaType === mediaType ? "(opsional: unggah untuk mengganti)" : "(wajib)"}<input ref={file} name="media" type="file" required={!editor.item?.hasMedia || editor.item.mediaType !== mediaType} accept={mediaType === "PDF" ? "application/pdf,.pdf" : "video/mp4,video/webm,.mp4,.webm"} className="mt-2 block w-full rounded-xl border border-[var(--line)] p-3 text-sm" /><span className="mt-2 block text-xs font-normal text-[var(--muted)]">{mediaType === "PDF" ? "PDF maksimal 10 MB. Halaman pertama menjadi thumbnail." : "MP4 / WEBM maksimal 50 MB. Thumbnail diambil dari video."}</span></label>}
                <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="isPinned" defaultChecked={editor.item?.isPinned} />Sematkan sebagai pengumuman penting</label>
                {message && <p role="status" className="text-sm text-[var(--danger)]">{message}</p>}
                <button type="submit" disabled={pending} className="ui-button ui-button-primary justify-self-start">{pending ? "Menyimpan..." : editor.item ? "Simpan perubahan" : "Simpan pengumuman"}</button>
            </form>
        </Dialog>}
        {confirmation && <ConfirmDialog title={confirmation.title} description={confirmation.description} danger={confirmation.danger} confirmLabel="Ya, lanjutkan" onCancel={() => setConfirmation(null)} onConfirm={() => { const action = confirmation; setConfirmation(null); void action.run(); }} />}
    </div>;
}

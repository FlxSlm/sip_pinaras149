"use client";

import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";

type Announcement = {
    id: string;
    title: string;
    content: string;
    mediaType: string;
    mediaRef: string | null;
    isPinned: boolean;
    status: string;
    publishedAt: string | null;
    createdAt: string;
};

const statusLabel: Record<string, string> = { DRAFT: "Draft", PUBLISHED: "Terbit", ARCHIVED: "Arsip" };
const statusTone: Record<string, string> = {
    DRAFT: "bg-[var(--surface)] text-[var(--muted)]",
    PUBLISHED: "bg-[var(--soft-accent)] text-[var(--leaf-dark)]",
    ARCHIVED: "bg-[#fbe9e7] text-[var(--danger)]",
};

type Filter = "ALL" | "PUBLISHED" | "DRAFT";

export function AnnouncementManager() {
    const [items, setItems] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [pending, setPending] = useState(false);
    const [filter, setFilter] = useState<Filter>("ALL");

    const [editingId, setEditingId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [mediaType, setMediaType] = useState("TEXT");
    const [isPinned, setIsPinned] = useState(false);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function refresh() {
        const response = await fetch("/api/admin/pengumuman", { cache: "no-store" });
        if (response.ok) setItems((await response.json()) as Announcement[]);
    }

    useEffect(() => {
        void fetch("/api/admin/pengumuman", { cache: "no-store" })
            .then((response) => response.ok ? response.json() as Promise<Announcement[]> : [])
            .then((result) => setItems(Array.isArray(result) ? result : []))
            .finally(() => setLoading(false));
    }, []);

    function startEdit(item: Announcement) {
        setEditingId(item.id);
        setTitle(item.title);
        setContent(item.content);
        setMediaType(item.mediaType);
        setIsPinned(item.isPinned);
        setMediaFile(null);
    }

    function resetForm() {
        setEditingId(null);
        setTitle("");
        setContent("");
        setMediaType("TEXT");
        setIsPinned(false);
        setMediaFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    async function doSubmit(status: "DRAFT" | "PUBLISHED") {
        if (title.trim().length < 3 || content.trim().length < 1) {
            setMessage("Judul dan isi pengumuman wajib diisi.");
            return;
        }
        setPending(true);
        setMessage("");

        const formData = new FormData();
        formData.set("title", title);
        formData.set("content", content);
        formData.set("mediaType", mediaType);
        formData.set("isPinned", String(isPinned));
        formData.set("status", status);
        if (mediaFile) formData.set("media", mediaFile);
        if (editingId) formData.set("id", editingId);

        const response = await fetch("/api/admin/pengumuman", { method: editingId ? "PATCH" : "POST", body: formData });
        const result = (await response.json()) as { message?: string };
        setMessage(result.message ?? (response.ok ? (editingId ? "Pengumuman diperbarui." : "Pengumuman disimpan.") : "Gagal menyimpan."));
        if (response.ok) resetForm();
        void refresh();
        setPending(false);
    }

    async function setStatus(id: string, action: "publish" | "unpublish") {
        setPending(true);
        const response = await fetch("/api/admin/pengumuman", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action }) });
        if (!response.ok) {
            const result = (await response.json()) as { message?: string };
            setMessage(result.message ?? "Gagal.");
        }
        void refresh();
        setPending(false);
    }

    async function remove(id: string) {
        setPending(true);
        await fetch("/api/admin/pengumuman", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
        setDeleteTarget(null);
        void refresh();
        setPending(false);
    }

    const filtered = items.filter((item) => filter === "ALL" || item.status === filter);
    const inputClass = "w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]";

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
                <h2 className="text-lg font-extrabold text-[var(--ink)]">{editingId ? "Edit pengumuman" : "Buat pengumuman"}</h2>
                <div className="mt-4 space-y-4">
                    <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={160} placeholder="Judul pengumuman" className={inputClass} />
                    <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={5} placeholder="Isi pengumuman" className={inputClass} />
                    <div className="grid gap-3 sm:grid-cols-2">
                        <select value={mediaType} onChange={(event) => setMediaType(event.target.value)} className={inputClass}>
                            <option value="TEXT">Teks</option>
                            <option value="PDF">PDF</option>
                            <option value="VIDEO">Video</option>
                        </select>
                        {mediaType !== "TEXT" && (
                            <input ref={fileInputRef} type="file" accept={mediaType === "PDF" ? "application/pdf,.pdf" : "video/mp4,video/webm,.mp4,.webm"} onChange={(event) => setMediaFile(event.target.files?.[0] ?? null)} className={inputClass} />
                        )}
                    </div>
                    <label className="flex items-center gap-2 text-sm text-[var(--ink)]">
                        <input type="checkbox" checked={isPinned} onChange={(event) => setIsPinned(event.target.checked)} /> Sematkan sebagai pengumuman penting
                    </label>
                </div>
                {message && <p className="mt-3 text-sm text-[var(--muted)]" role="status">{message}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" disabled={pending} onClick={() => void doSubmit("PUBLISHED")} className="rounded-lg bg-[var(--leaf)] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                        {pending ? "Menyimpan..." : editingId ? "Simpan & Terbitkan" : "Terbitkan"}
                    </button>
                    <button type="button" disabled={pending} onClick={() => void doSubmit("DRAFT")} className="rounded-lg border border-[var(--line)] px-5 py-2.5 text-sm font-bold text-[var(--ink)] disabled:opacity-60">
                        Simpan sebagai Draft
                    </button>
                    {editingId && <button type="button" onClick={resetForm} className="rounded-lg border border-[var(--line)] px-5 py-2.5 text-sm font-bold text-[var(--ink)]">Batal</button>}
                </div>
            </div>

            <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-extrabold text-[var(--ink)]">Daftar pengumuman</h2>
                    <div className="flex gap-1 rounded-lg border border-[var(--line)] bg-white p-1">
                        {([["ALL", "Semua"], ["PUBLISHED", "Diterbitkan"], ["DRAFT", "Draft"]] as Array<[Filter, string]>).map(([value, label]) => (
                            <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-md px-3 py-1.5 text-xs font-bold ${filter === value ? "bg-[var(--brand)] text-white" : "text-[var(--muted)]"}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="mt-4 space-y-3">{[0, 1].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-white" />)}</div>
                ) : filtered.length === 0 ? (
                    <p className="mt-4 rounded-2xl border border-[var(--line)] bg-white p-6 text-sm text-[var(--muted)]">Belum ada pengumuman.</p>
                ) : (
                    <div className="mt-4 space-y-3">
                        {filtered.map((item) => (
                            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-bold text-[var(--ink)]">{item.title}</p>
                                        {item.isPinned && <span className="rounded-full bg-[var(--gold-soft)] px-2 py-0.5 text-xs font-bold text-[var(--gold)]">Penting</span>}
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${statusTone[item.status]}`}>{statusLabel[item.status] ?? item.status}</span>
                                        {item.mediaType !== "TEXT" && <span className="rounded-full bg-[#e7f0fa] px-2 py-0.5 text-xs font-bold text-[var(--brand-dark)]">{item.mediaType}</span>}
                                    </div>
                                    <p className="mt-1 text-xs text-[var(--muted)]">{new Date(item.createdAt).toLocaleDateString("id-ID")}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {item.status === "DRAFT" && <button type="button" onClick={() => void setStatus(item.id, "publish")} className="rounded-lg bg-[var(--leaf)] px-3 py-2 text-xs font-bold text-white">Terbitkan</button>}
                                    {item.status === "PUBLISHED" && <button type="button" onClick={() => void setStatus(item.id, "unpublish")} className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-bold text-[var(--ink)]">Jadikan Draft</button>}
                                    <button type="button" onClick={() => startEdit(item)} className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-bold text-[var(--ink)]">Edit</button>
                                    <button type="button" onClick={() => setDeleteTarget(item)} className="rounded-lg border border-[var(--danger)] px-3 py-2 text-xs font-bold text-[var(--danger)]">Hapus</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {deleteTarget && (
                <ConfirmDialog
                    title="Hapus pengumuman?"
                    description={`"${deleteTarget.title}" akan dihapus permanen.`}
                    confirmLabel="Ya, Hapus"
                    danger
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={() => void remove(deleteTarget.id)}
                />
            )}
        </div>
    );
}

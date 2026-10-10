"use client";

import { useState } from "react";
import { AnnouncementCard } from "@/components/announcement-card";
import { Icon } from "@/components/ui/icon";
import type { AnnouncementCardData } from "@/lib/announcements";

export function AnnouncementList({ items }: { items: AnnouncementCardData[] }) {
    const [query, setQuery] = useState("");
    const [type, setType] = useState("ALL");
    const [page, setPage] = useState(1);
    const filtered = items.filter((item) => (type === "ALL" || item.mediaType === type) && (item.title + " " + item.excerpt).toLocaleLowerCase("id-ID").includes(query.trim().toLocaleLowerCase("id-ID")));
    const pages = Math.max(1, Math.ceil(filtered.length / 6));
    return <div><div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="relative"><span className="sr-only">Cari pengumuman</span><Icon name="search" className="absolute left-3 top-3.5 size-5 text-[var(--muted)]" /><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Cari pengumuman..." className="w-full !pl-10" /></label>
        <label><span className="sr-only">Jenis pengumuman</span><select value={type} onChange={(event) => { setType(event.target.value); setPage(1); }} className="w-full"><option value="ALL">Semua jenis</option><option value="TEXT">Informasi teks</option><option value="PDF">Dokumen PDF</option><option value="VIDEO">Video</option></select></label>
    </div><p className="mb-3 text-sm text-[var(--muted)]" role="status">{filtered.length} pengumuman{query ? " ditemukan" : " tersedia"}</p>
    {filtered.length ? <div className="grid gap-3">{filtered.slice((page - 1) * 6, page * 6).map((item) => <AnnouncementCard key={item.id} item={item} />)}</div> : <div className="rounded-xl border border-dashed border-[var(--line)] bg-white p-8 text-center"><Icon name="announcement" className="mx-auto mb-3 size-10 text-[var(--brand)]" /><h3 className="text-lg font-semibold">{items.length ? "Pengumuman tidak ditemukan" : "Belum ada pengumuman terbit"}</h3><p className="mt-2 text-sm text-[var(--muted)]">{items.length ? "Coba kata kunci atau jenis media yang lain." : "Informasi resmi kelurahan akan tersedia di sini setelah diterbitkan."}</p></div>}
    {pages > 1 && <nav aria-label="Halaman pengumuman" className="mt-5 flex items-center justify-between gap-3"><button className="ui-button ui-button-secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Sebelumnya</button><span className="text-sm">{page} / {pages}</span><button className="ui-button ui-button-secondary" disabled={page === pages} onClick={() => setPage(page + 1)}>Berikutnya</button></nav>}
    </div>;
}

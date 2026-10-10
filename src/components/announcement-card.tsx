import Link from "next/link";
import { AnnouncementThumbnail } from "@/components/announcement-thumbnail";
import { Icon } from "@/components/ui/icon";
import type { AnnouncementCardData } from "@/lib/announcements";

export function AnnouncementCard({ item, compact = false }: { item: AnnouncementCardData; compact?: boolean }) {
    return <article className="min-w-0 rounded-xl border border-[var(--line)] bg-white p-4 transition hover:border-[var(--brand)]">
        <Link href={`/pengumuman/${encodeURIComponent(item.slug)}`} className={compact ? "grid gap-4" : "grid gap-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center"}>
            <AnnouncementThumbnail key={item.slug + item.mediaType + item.revision} title={item.title} mediaType={item.mediaType} mediaUrl={item.hasMedia ? `/api/pengumuman/${encodeURIComponent(item.slug)}/media?v=${encodeURIComponent(item.revision)}` : undefined} />
            <div className="min-w-0"><div className="mb-2 flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded bg-[var(--brand-soft)] px-2 py-1 text-[var(--brand-dark)]">{item.mediaType === "TEXT" ? "Informasi" : item.mediaType === "PDF" ? "Dokumen PDF" : "Video"}</span>{item.isPinned && <span className="rounded bg-[var(--gold-soft)] px-2 py-1 text-[var(--gold)]">Penting</span>}</div><h3 className="text-lg font-semibold leading-snug">{item.title}</h3><p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--muted)]">{item.excerpt}</p><div className="mt-3 flex items-center justify-between gap-3 text-xs text-[var(--muted)]"><time dateTime={item.date}>{new Date(item.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Makassar" })}</time><span className="inline-flex items-center gap-1 font-semibold text-[var(--brand-dark)]">Baca <Icon name="arrow" className="size-4" /></span></div></div>
        </Link>
    </article>;
}

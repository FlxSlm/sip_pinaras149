import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AnnouncementContent } from "@/components/announcement-content";
import { Icon } from "@/components/ui/icon";

export const dynamic = "force-dynamic";
export default async function AnnouncementDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const announcement = await prisma.announcement.findFirst({ where: { slug, status: "PUBLISHED" } });
    if (!announcement) notFound();
    const others = await prisma.announcement.findMany({ where: { status: "PUBLISHED", id: { not: announcement.id } }, take: 3, orderBy: { publishedAt: "desc" }, select: { id: true, title: true, slug: true } });
    const date = announcement.publishedAt ?? announcement.createdAt;
    return <div className="public-container public-section">
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]"><Link href="/">Beranda</Link><Icon name="chevron" className="size-4" /><Link href="/pengumuman">Pengumuman</Link><Icon name="chevron" className="size-4" /><span aria-current="page">Detail</span></nav>
        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_17rem]"><article className="min-w-0 rounded-xl border border-[var(--line)] bg-white p-5 sm:p-8"><div className="mb-3 flex flex-wrap gap-2"><span className="rounded bg-[var(--brand-soft)] px-2 py-1 text-xs font-semibold text-[var(--brand-dark)]">{announcement.mediaType === "TEXT" ? "Informasi" : announcement.mediaType === "PDF" ? "Dokumen PDF" : "Video"}</span>{announcement.isPinned && <span className="rounded bg-[var(--gold-soft)] px-2 py-1 text-xs font-semibold text-[var(--gold)]">Pengumuman penting</span>}</div><h1 className="public-title">{announcement.title}</h1><p className="mt-4 border-b border-[var(--line)] pb-5 text-sm text-[var(--muted)]"><time dateTime={date.toISOString()}>{date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Makassar" })}</time> · Kelurahan Pinaras</p><AnnouncementContent title={announcement.title} content={announcement.content} mediaType={announcement.mediaType} mediaUrl={announcement.mediaRef ? "/api/pengumuman/" + encodeURIComponent(announcement.slug) + "/media" : undefined} /><Link href="/pengumuman" className="ui-button ui-button-secondary mt-7">Kembali ke pengumuman</Link></article>
        <aside className="rounded-xl border border-[var(--line)] bg-white p-5"><h2 className="text-lg font-semibold">Pengumuman lainnya</h2>{others.length ? <ul className="mt-3 divide-y divide-[var(--line)]">{others.map((item) => <li key={item.id}><Link href={"/pengumuman/" + encodeURIComponent(item.slug)} className="flex items-start justify-between gap-3 py-4 text-sm font-semibold">{item.title}<Icon name="arrow" className="mt-1 size-4" /></Link></li>)}</ul> : <p className="mt-3 text-sm text-[var(--muted)]">Belum ada pengumuman lainnya.</p>}</aside></div>
    </div>;
}

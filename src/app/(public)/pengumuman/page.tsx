import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getLandingContent } from "@/lib/cms";
import { publicAnnouncementSelect, toAnnouncementCard } from "@/lib/announcements";
import { AnnouncementList } from "@/components/announcement-list";
import { Icon } from "@/components/ui/icon";

export const dynamic = "force-dynamic";
export default async function AnnouncementsPage() {
    const [announcements, content] = await Promise.all([
        prisma.announcement.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }], select: publicAnnouncementSelect }),
        getLandingContent(),
    ]);
    const image = typeof content.hero.image === "string" ? content.hero.image : "/images/panorama-pinaras.png";
    const contacts = Object.entries(content.kontak).filter(([, value]) => typeof value === "string" && value);
    return <>
        <section className="bg-[var(--brand-deep)] text-white" style={{ backgroundImage: `linear-gradient(90deg, rgb(6 53 76 / 96%), rgb(6 53 76 / 55%)), url("${image}")`, backgroundSize: "cover", backgroundPosition: "center" }}><div className="public-container py-10 sm:py-14"><p className="mb-3 text-sm font-semibold text-white/85">PENGUMUMAN</p><h1 className="public-title max-w-xl">Informasi terbaru Kelurahan Pinaras</h1><p className="mt-4 max-w-xl leading-7 text-white/90">Baca informasi, dokumen, dan video yang diterbitkan oleh admin kelurahan.</p></div></section>
        <div className="public-container public-section"><nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-[var(--muted)]"><Link href="/">Beranda</Link><Icon name="chevron" className="size-4" /><span aria-current="page">Pengumuman</span></nav><div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_18rem]"><section className="min-w-0"><h2 className="mb-4 text-2xl font-semibold">Daftar pengumuman</h2><AnnouncementList items={announcements.map(toAnnouncementCard)} /></section><aside className="grid gap-4"><section className="rounded-xl border border-[var(--line)] bg-white p-5"><h2 className="flex items-center gap-2 font-semibold"><Icon name="announcement" />Jenis informasi</h2><p className="mt-3 text-sm leading-6 text-[var(--muted)]">Pengumuman tersedia dalam bentuk teks, dokumen PDF, dan video. Gunakan pencarian untuk menemukan informasi yang Anda perlukan.</p><dl className="mt-4 divide-y divide-[var(--line)]">{[["TEXT", "Informasi teks"], ["PDF", "Dokumen PDF"], ["VIDEO", "Video"]].map(([type, label]) => <div key={type} className="flex justify-between py-3 text-sm"><dt>{label}</dt><dd className="font-semibold">{announcements.filter((item) => item.mediaType === type).length}</dd></div>)}</dl></section><section className="rounded-xl bg-[var(--soft-accent)] p-5"><h2 className="font-semibold text-[var(--leaf-dark)]">Tetap terhubung</h2><p className="mt-3 text-sm leading-6 text-[var(--leaf-dark)]">Masuk ke ruang warga untuk membaca notifikasi pengumuman dan memantau pengaduan Anda.</p><Link href="/warga/notifikasi" className="ui-button ui-button-success mt-4">Ruang warga</Link></section><section className="rounded-xl border border-[var(--line)] bg-white p-5"><h2 className="font-semibold">Kontak kelurahan</h2>{contacts.length ? <dl className="mt-3 grid gap-3">{contacts.map(([key, value]) => <div key={key}><dt className="text-sm capitalize text-[var(--muted)]">{key}</dt><dd className="break-words text-sm">{String(value)}</dd></div>)}</dl> : <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Kontak resmi belum tersedia. Gunakan layanan pengaduan untuk menyampaikan permasalahan.</p>}<Link href="/#kontak" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--brand-dark)]">Lihat kontak <Icon name="arrow" className="size-4" /></Link></section></aside></div></div>
    </>;
}

import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
    const announcements = await prisma.announcement.findMany({
        where: { status: "PUBLISHED" },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    });

    return (
        <main className="min-h-screen bg-[var(--surface)]">
            <div className="border-b border-[var(--line)] bg-white px-5 py-8 sm:px-8 sm:py-10">
                <div className="mx-auto max-w-5xl">
                    <Link href="/" className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--leaf)] hover:text-[var(--leaf-dark)]">
                        <Image src="/images/logo tomohon.png" alt="Logo Tomohon" width={28} height={28} className="size-7 rounded-md object-contain" />
                        SIP Pinaras
                    </Link>
                    <h1 className="mt-2 text-2xl font-bold text-[var(--ink)] sm:text-3xl">Pengumuman</h1>
                    <p className="mt-1 text-[13px] text-[var(--muted)]">Informasi resmi Kelurahan Pinaras</p>
                </div>
            </div>
            <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
                {announcements.length === 0 && <p className="text-[13px] text-[var(--muted)]">Belum ada pengumuman.</p>}
                <div className="space-y-2">
                    {announcements.map((item) => (
                        <Link href={`/pengumuman/${item.slug}`} key={item.id} className="flex items-start justify-between gap-4 rounded-xl border border-[var(--line)] bg-white px-5 py-4 transition hover:border-[var(--brand)]/30 hover:shadow-sm">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    {item.isPinned && <span className="rounded bg-[var(--gold-soft)] px-1.5 py-0.5 text-[10px] font-semibold text-[#8a5a12]">Penting</span>}
                                    <p className="text-[11px] text-[var(--muted)]">{item.createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                                </div>
                                <h2 className="mt-1 text-[15px] font-semibold text-[var(--ink)]">{item.title}</h2>
                            </div>
                            <svg viewBox="0 0 24 24" className="mt-1 size-4 shrink-0 text-[var(--muted)]" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6Z" /></svg>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}

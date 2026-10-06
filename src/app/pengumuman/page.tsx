import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
    const announcements = await prisma.announcement.findMany({
        where: { status: "PUBLISHED" },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    });

    return (
        <main className="min-h-screen bg-[var(--surface)] px-6 py-12">
            <div className="mx-auto max-w-5xl">
                <Link href="/" className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--leaf)]">SIP Pinaras</Link>
                <h1 className="mt-3 text-4xl font-extrabold text-[var(--ink)]">Pengumuman</h1>
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                    {announcements.map((item) => (
                        <Link href={`/pengumuman/${item.slug}`} key={item.id} className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--leaf)]">{item.isPinned ? "Penting" : "Pengumuman"}</p>
                            <h2 className="mt-2 text-xl font-bold text-[var(--ink)]">{item.title}</h2>
                            <p className="mt-2 text-sm text-[var(--muted)]">{item.createdAt.toLocaleDateString("id-ID")}</p>
                        </Link>
                    ))}
                    {announcements.length === 0 && <p className="text-[var(--muted)]">Belum ada pengumuman.</p>}
                </div>
            </div>
        </main>
    );
}

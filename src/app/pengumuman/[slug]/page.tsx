import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AnnouncementDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const announcement = await prisma.announcement.findFirst({ where: { slug, status: "PUBLISHED" } });
    if (!announcement) notFound();

    const mediaUrl = `/api/pengumuman/${announcement.slug}/media`;

    return (
        <main className="min-h-screen bg-[var(--surface)] px-6 py-12">
            <article className="mx-auto max-w-3xl rounded-2xl border border-[var(--line)] bg-white p-8 shadow-sm">
                <Link href="/pengumuman" className="text-sm font-bold text-[var(--leaf)]">← Kembali ke pengumuman</Link>
                <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-[var(--leaf)]">{announcement.isPinned ? "Pengumuman penting" : "Pengumuman"}</p>
                <h1 className="mt-3 text-4xl font-extrabold text-[var(--ink)]">{announcement.title}</h1>
                <p className="mt-2 text-sm text-[var(--muted)]">{announcement.createdAt.toLocaleDateString("id-ID")}</p>

                <div className="mt-8 whitespace-pre-wrap leading-7 text-[var(--ink)]">{announcement.content}</div>

                {announcement.mediaType === "PDF" && announcement.mediaRef && (
                    <div className="mt-8">
                        <iframe src={mediaUrl} title={announcement.title} className="h-[70vh] w-full rounded-xl border border-[var(--line)]" />
                        <a href={mediaUrl} download className="mt-3 inline-flex rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-bold text-white">Unduh PDF</a>
                    </div>
                )}

                {announcement.mediaType === "VIDEO" && announcement.mediaRef && (
                    <div className="mt-8">
                        <video controls className="w-full rounded-xl border border-[var(--line)]">
                            <source src={mediaUrl} />
                            Browser Anda tidak mendukung pemutar video.
                        </video>
                    </div>
                )}
            </article>
        </main>
    );
}

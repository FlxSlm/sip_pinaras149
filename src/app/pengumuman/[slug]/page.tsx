import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AnnouncementDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const announcement = await prisma.announcement.findFirst({ where: { slug, published: true } });
    if (!announcement) notFound();
    return <main className="min-h-screen px-6 py-12"><article className="mx-auto max-w-3xl rounded-xl border border-[var(--line)] bg-white p-8 shadow-sm"><p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Pengumuman</p><h1 className="mt-3 text-4xl font-bold">{announcement.title}</h1><p className="mt-2 text-sm text-[var(--muted)]">{announcement.createdAt.toLocaleDateString("id-ID")}</p><div className="mt-8 whitespace-pre-wrap leading-7 text-[var(--ink)]">{announcement.content}</div>{announcement.pdfPath && <a className="mt-8 inline-flex rounded-md bg-[var(--ink)] px-4 py-3 font-semibold text-white" href={`/${announcement.pdfPath}`}>Buka dokumen PDF</a>}</article></main>;
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PublicComplaintDetail({ params }: { params: Promise<{ ticketNumber: string }> }) {
    const { ticketNumber } = await params;
    const complaint = await prisma.complaint.findFirst({
        where: { ticketNumber, publicationStatus: "PUBLISHED" },
        select: {
            ticketNumber: true,
            title: true,
            category: true,
            handlingStatus: true,
            officialResponse: true,
            rating: true,
            publishedAt: true,
            lingkungan: { select: { name: true } },
        },
    });

    if (!complaint) notFound();

    return (
        <main className="min-h-screen bg-[var(--surface)] px-5 py-8 sm:px-8 sm:py-12">
            <div className="mx-auto max-w-3xl">
                <Link href="/pengaduan" className="text-sm font-bold text-[var(--accent)]">← Kembali ke pengaduan publik</Link>
                <article className="mt-8 rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_20px_50px_rgba(20,40,55,0.08)] sm:p-10">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">{complaint.ticketNumber}</p>
                    <h1 className="mt-3 text-3xl font-bold leading-tight text-[var(--ink)] sm:text-4xl">{complaint.title}</h1>
                    <p className="mt-3 text-sm text-[var(--muted)]">{complaint.category} · {complaint.lingkungan.name} · {complaint.handlingStatus.replaceAll("_", " ")}</p>
                    {complaint.officialResponse && <div className="mt-8 border-l-2 border-[var(--accent)] pl-5 text-sm leading-7 text-[var(--ink)]"><p className="font-bold">Respon resmi</p><p className="mt-2">{complaint.officialResponse}</p></div>}
                    <div className="mt-8 flex flex-wrap gap-6 border-t border-[var(--line)] pt-5 text-sm text-[var(--muted)]">
                        <span>{complaint.publishedAt?.toLocaleDateString("id-ID")}</span>
                        {complaint.rating !== null && <span className="font-bold text-[var(--gold)]">★ {complaint.rating}/5</span>}
                    </div>
                </article>
            </div>
        </main>
    );
}
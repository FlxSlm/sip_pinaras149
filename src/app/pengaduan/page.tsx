import Link from "next/link";
import { PublicComplaintList } from "@/components/public-complaint-list";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PublicComplaintsPage() {
    const complaints = await prisma.complaint.findMany({
        where: { publicationStatus: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
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
    const ratedComplaints = complaints.filter((complaint) => complaint.rating !== null);
    const averageRating = ratedComplaints.length === 0 ? null : (ratedComplaints.reduce((total, complaint) => total + (complaint.rating ?? 0), 0) / ratedComplaints.length).toFixed(1);

    return (
        <main className="min-h-screen bg-[var(--surface)] px-5 py-8 sm:px-8 sm:py-12">
            <div className="mx-auto max-w-5xl">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <Link href="/" className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--accent)]">SIP Pinaras</Link>
                        <h1 className="mt-4 text-4xl font-bold leading-tight text-[var(--ink)] sm:text-5xl">Suara warga, tindak lanjut yang terlihat.</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">Daftar ini hanya memuat informasi yang telah dipilih Lurah untuk dipublikasikan. Identitas pelapor, kontak, catatan internal, dan file bukti tidak ditampilkan.</p>
                    </div>
                    <Link href="/login" className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white shadow-sm">Masuk</Link>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[var(--ink)] p-5 text-white"><p className="text-3xl font-bold">{complaints.length}</p><p className="mt-1 text-sm text-white/70">Pengaduan terpublikasi</p></div>
                    <div className="rounded-2xl bg-[var(--gold-soft)] p-5 text-[var(--ink)]"><p className="text-3xl font-bold">{averageRating ?? "-"}<span className="ml-1 text-lg">★</span></p><p className="mt-1 text-sm text-[var(--muted)]">Rata-rata dari {ratedComplaints.length} rating warga</p></div>
                </div>
                <PublicComplaintList complaints={complaints.map((complaint) => ({ ...complaint, publishedAt: complaint.publishedAt?.toISOString() ?? null }))} />
            </div>
        </main>
    );
}

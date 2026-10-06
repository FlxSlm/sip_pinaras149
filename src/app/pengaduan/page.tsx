import Link from "next/link";
import { PublicComplaintList } from "@/components/public-complaint-list";
import { prisma } from "@/lib/prisma";
import { publicComplaintSelect, toPublicComplaint } from "@/lib/complaint-projection";

export const dynamic = "force-dynamic";

export default async function PublicComplaintsPage() {
    const complaints = await prisma.complaint.findMany({
        where: { status: { in: ["SELESAI", "DITOLAK"] } },
        orderBy: [{ completedAt: "desc" }, { rejectedAt: "desc" }, { createdAt: "desc" }],
        select: publicComplaintSelect,
    });

    const total = complaints.length;
    const selesai = complaints.filter((complaint) => complaint.status === "SELESAI").length;
    const ditolak = complaints.filter((complaint) => complaint.status === "DITOLAK").length;

    return (
        <main className="min-h-screen bg-[var(--surface)] px-5 py-10 sm:px-8 sm:py-14">
            <div className="mx-auto max-w-5xl">
                <Link href="/" className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--leaf)]">SIP Pinaras</Link>
                <h1 className="mt-4 text-4xl font-extrabold leading-tight text-[var(--ink)] sm:text-5xl">Forum pengaduan publik</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                    Hanya pengaduan yang telah <strong>selesai</strong> atau <strong>ditolak</strong> yang ditampilkan. Identitas pelapor, kontak, dan bukti privat tidak pernah dipublikasikan.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-[var(--brand-deep)] p-5 text-white">
                        <p className="text-3xl font-extrabold">{total}</p>
                        <p className="mt-1 text-sm text-white/70">Total publik</p>
                    </div>
                    <div className="rounded-2xl bg-[var(--soft-accent)] p-5 text-[var(--ink)]">
                        <p className="text-3xl font-extrabold">{selesai}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">Selesai</p>
                    </div>
                    <div className="rounded-2xl bg-[#fbe9e7] p-5 text-[var(--ink)]">
                        <p className="text-3xl font-extrabold">{ditolak}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">Ditolak</p>
                    </div>
                </div>

                <div className="mt-8">
                    <PublicComplaintList complaints={complaints.map((complaint) => toPublicComplaint(complaint))} />
                </div>
            </div>
        </main>
    );
}

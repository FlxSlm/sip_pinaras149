import Link from "next/link";
import Image from "next/image";
import { PublicComplaintList } from "@/components/public-complaint-list";
import { prisma } from "@/lib/prisma";
import { publicComplaintSelect, toPublicComplaint, PUBLIC_COMPLAINT_STATUSES } from "@/lib/complaint-projection";

export const dynamic = "force-dynamic";

export default async function PublicComplaintsPage() {
    const complaints = await prisma.complaint.findMany({
        where: { status: { in: [...PUBLIC_COMPLAINT_STATUSES] } },
        orderBy: [{ completedAt: "desc" }, { rejectedAt: "desc" }, { createdAt: "desc" }],
        select: publicComplaintSelect,
    });

    const total = complaints.length;
    const selesai = complaints.filter((complaint) => complaint.status === "SELESAI").length;
    const ditolak = complaints.filter((complaint) => complaint.status === "DITOLAK").length;

    return (
        <main className="min-h-screen bg-[var(--surface)]">
            {/* Header banner */}
            <div className="nature-hero px-5 py-10 text-white sm:px-8 sm:py-14">
                <div className="mx-auto max-w-5xl">
                    <Link href="/" className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70 hover:text-white">
                        <Image src="/images/logo tomohon.png" alt="Logo Tomohon" width={28} height={28} className="logo-pentagon size-7 object-contain" />
                        SIP Pinaras
                    </Link>
                    <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">Forum Pengaduan Publik</h1>
                    <p className="mt-2 max-w-2xl text-[13px] leading-6 text-white/75">
                        Hanya pengaduan yang telah <strong className="text-white">selesai</strong> atau <strong className="text-white">ditolak</strong> yang ditampilkan. Identitas pelapor, kontak, dan bukti privat tidak pernah dipublikasikan.
                    </p>

                    {/* Compact stat strip */}
                    <div className="mt-6 inline-flex flex-wrap gap-4 rounded-lg bg-white/10 px-5 py-3 backdrop-blur">
                        <div>
                            <p className="text-xl font-bold">{total}</p>
                            <p className="text-[11px] text-white/60">Total publik</p>
                        </div>
                        <div className="w-px bg-white/20" />
                        <div>
                            <p className="text-xl font-bold">{selesai}</p>
                            <p className="text-[11px] text-white/60">Selesai</p>
                        </div>
                        <div className="w-px bg-white/20" />
                        <div>
                            <p className="text-xl font-bold">{ditolak}</p>
                            <p className="text-[11px] text-white/60">Ditolak</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
                <PublicComplaintList complaints={complaints.map((complaint) => toPublicComplaint(complaint))} />
            </div>
        </main>
    );
}

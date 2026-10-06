import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { LurahInbox } from "@/components/lurah-inbox";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getComplaintStats } from "@/lib/dashboard";
import { AnnouncementForm } from "@/components/announcement-form";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function LurahPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    if (session.user.role !== "lurah") redirect("/petugas");

    const [complaints, stats] = await Promise.all([prisma.complaint.findMany({
        where: { handlingStatus: { in: ["DITERUSKAN_KE_LURAH", "DALAM_PROSES", "SELESAI", "DI_LUAR_KEWENANGAN"] } },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            ticketNumber: true,
            title: true,
            category: true,
            description: true,
            handlingStatus: true,
            internalNote: true,
            officialResponse: true,
            publicationStatus: true,
            createdAt: true,
            lingkungan: { select: { name: true, code: true } },
            reporter: { select: { name: true, email: true, phone: true } },
            evidences: { select: { id: true, path: true, mimeType: true } },
        },
    }), getComplaintStats(prisma, {})]);

    return (
        <DashboardShell role="lurah" userName={session.user.name ?? session.user.email ?? "Lurah"}>
            <div className="mx-auto max-w-4xl">
                <section className="mt-8 grid gap-3 sm:grid-cols-4">{[["Total laporan", stats.total], ["Selesai", stats.selesai], ["Diproses", stats.dalamProses], ["Ditolak", stats.ditolak]].map(([label, value]) => <div key={label} className="rounded-xl border border-[var(--line)] bg-white p-4 shadow-sm"><p className="text-sm text-[var(--muted)]">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>)}</section>
                <AnnouncementForm />
                <div id="pengaduan"><LurahInbox initialComplaints={complaints.map((complaint) => ({ ...complaint, createdAt: complaint.createdAt.toISOString() }))} /></div>
            </div>
        </DashboardShell>
    );
}
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { LurahInbox } from "@/components/lurah-inbox";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getComplaintStats } from "@/lib/dashboard";
import { NotificationBell } from "@/components/notification-bell";
import { AnnouncementForm } from "@/components/announcement-form";

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
        },
    }), getComplaintStats(prisma, {})]);

    return (
        <main className="min-h-screen bg-[var(--surface)] px-6 py-12">
            <div className="mx-auto max-w-4xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Area Lurah</p>
                        <h1 className="mt-3 text-3xl font-semibold text-[var(--ink)]">Selamat datang, {session.user.name ?? session.user.email}</h1>
                    </div>
                    <div className="flex items-center gap-2"><NotificationBell /><LogoutButton /></div>
                </div>
                <section className="mt-8 grid gap-3 sm:grid-cols-4">{[["Total laporan", stats.total], ["Selesai", stats.selesai], ["Diproses", stats.dalamProses], ["Ditolak", stats.ditolak]].map(([label, value]) => <div key={label} className="rounded-xl border border-[var(--line)] bg-white p-4 shadow-sm"><p className="text-sm text-[var(--muted)]">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>)}</section>
                <AnnouncementForm />
                <LurahInbox initialComplaints={complaints.map((complaint) => ({ ...complaint, createdAt: complaint.createdAt.toISOString() }))} />
            </div>
        </main>
    );
}
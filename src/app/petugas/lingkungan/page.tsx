import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { NeighborhoodInbox } from "@/components/neighborhood-inbox";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function LingkunganPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    if (session.user.role !== "kepala_lingkungan") redirect("/petugas");

    if (!session.user.lingkunganId) redirect("/login");
    const [lingkungan, complaints] = await Promise.all([
        prisma.lingkungan.findUnique({ where: { id: session.user.lingkunganId }, select: { name: true } }),
        prisma.complaint.findMany({
            where: { lingkunganId: session.user.lingkunganId },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                ticketNumber: true,
                title: true,
                category: true,
                description: true,
                handlingStatus: true,
                internalNote: true,
                createdAt: true,
                reporter: { select: { name: true, email: true, phone: true } },
            },
        }),
    ]);

    return (
        <main className="min-h-screen bg-[var(--surface)] px-6 py-12">
            <div className="mx-auto max-w-4xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Area Kepala Lingkungan</p>
                        <h1 className="mt-3 text-3xl font-semibold text-[var(--ink)]">Selamat datang, {session.user.name ?? session.user.email}</h1>
                        <p className="mt-3 text-sm text-[var(--muted)]">Lingkungan: {lingkungan?.name ?? "Belum ditentukan"}</p>
                    </div>
                    <LogoutButton />
                </div>
                <NeighborhoodInbox initialComplaints={complaints.map((complaint) => ({ ...complaint, createdAt: complaint.createdAt.toISOString() }))} />
            </div>
        </main>
    );
}
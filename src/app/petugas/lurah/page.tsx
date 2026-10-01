import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { LurahInbox } from "@/components/lurah-inbox";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function LurahPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    if (session.user.role !== "lurah") redirect("/petugas");

    const complaints = await prisma.complaint.findMany({
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
    });

    return (
        <main className="min-h-screen bg-[var(--surface)] px-6 py-12">
            <div className="mx-auto max-w-4xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Area Lurah</p>
                        <h1 className="mt-3 text-3xl font-semibold text-[var(--ink)]">Selamat datang, {session.user.name ?? session.user.email}</h1>
                    </div>
                    <LogoutButton />
                </div>
                <LurahInbox initialComplaints={complaints.map((complaint) => ({ ...complaint, createdAt: complaint.createdAt.toISOString() }))} />
            </div>
        </main>
    );
}
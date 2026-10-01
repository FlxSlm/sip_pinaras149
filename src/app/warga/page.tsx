import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { authOptions } from "@/lib/auth";
import { UsernameForm } from "@/components/username-form";
import { ComplaintForm } from "@/components/complaint-form";
import { RatingControl } from "@/components/rating-control";
import { prisma } from "@/lib/prisma";

export default async function WargaPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    if (session.user.role !== "warga") redirect("/petugas");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { username: true },
    });
    if (!user) redirect("/login");

    const environments = await prisma.lingkungan.findMany({
        where: { active: true },
        select: { id: true, name: true },
        orderBy: { code: "asc" },
    });
    const complaints = await prisma.complaint.findMany({
        where: { reporterUserId: session.user.id },
        orderBy: { createdAt: "desc" },
        select: { id: true, ticketNumber: true, title: true, handlingStatus: true, rating: true, createdAt: true },
    });

    return (
        <main className="min-h-screen bg-[var(--surface)] px-6 py-12">
            <div className="mx-auto max-w-4xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Area Warga</p>
                        <h1 className="mt-3 text-3xl font-semibold text-[var(--ink)]">Halo, {session.user.name ?? session.user.email}</h1>
                        <p className="mt-3 text-sm text-[var(--muted)]">Username SIP: {user.username}</p>
                    </div>
                    <LogoutButton />
                </div>
                <section className="mt-10 max-w-xl rounded-lg border border-[var(--line)] bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-[var(--ink)]">Profil SIP</h2>
                    <p className="mt-2 text-sm text-[var(--muted)]">Username ini terpisah dari identitas Google Anda.</p>
                    <UsernameForm initialUsername={user.username} />
                </section>
                <section className="mt-6 max-w-xl rounded-lg border border-[var(--line)] bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-[var(--ink)]">Buat pengaduan</h2>
                    <p className="mt-2 text-sm text-[var(--muted)]">Pengaduan Anda akan diteruskan kepada petugas sesuai lingkungan yang dipilih.</p>
                    <ComplaintForm environments={environments} />
                </section>
                <section className="mt-6 max-w-xl rounded-lg border border-[var(--line)] bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-[var(--ink)]">Pengaduan saya</h2>
                    {complaints.length === 0 ? (
                        <p className="mt-3 text-sm text-[var(--muted)]">Belum ada pengaduan.</p>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {complaints.map((complaint) => (
                                <div key={complaint.ticketNumber} className="border-b border-[var(--line)] pb-4 last:border-0 last:pb-0">
                                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">{complaint.ticketNumber}</p>
                                    <p className="mt-1 font-medium text-[var(--ink)]">{complaint.title}</p>
                                    <p className="mt-1 text-sm text-[var(--muted)]">{complaint.handlingStatus.replaceAll("_", " ")} · {complaint.createdAt.toLocaleDateString("id-ID")}</p>
                                    {complaint.handlingStatus === "SELESAI" && complaint.rating === null && <RatingControl complaintId={complaint.id} />}
                                    {complaint.rating !== null && <p className="mt-3 text-sm font-semibold text-[var(--gold)]">Rating Anda: {complaint.rating}/5</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
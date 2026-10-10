import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfilePhotoForm } from "@/components/profile-photo-form";
import { DashboardShell } from "@/components/dashboard-shell";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function WargaProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    if (session.user.role !== "WARGA") redirect("/admin");

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true, image: true, customImage: true } });

    return (
        <DashboardShell role="warga" userName={user?.name ?? session.user.email ?? "Warga"}>
            <div className="mx-auto max-w-5xl">
                <h1 className="text-2xl font-extrabold text-[var(--ink)]">Profil</h1>
                <p className="mt-2 text-sm text-[var(--muted)]">Foto dan informasi akun yang Anda gunakan di SIPP.</p>
                <div className="mt-6 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
                    <ProfilePhotoForm imageUrl={user?.customImage ? "/api/profile/photo" : (user?.image ?? null)} name={user?.name ?? "W"} hasCustomPhoto={Boolean(user?.customImage)} />
                    <div className="mt-6 grid gap-4 border-t border-[var(--line)] pt-6 sm:grid-cols-2">
                        <div>
                            <p className="text-sm font-semibold text-[var(--muted)]">Nama</p>
                            <p className="mt-1 font-bold text-[var(--ink)]">{user?.name ?? "—"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-[var(--muted)]">Email</p>
                            <p className="mt-1 font-bold text-[var(--ink)]">{user?.email ?? "—"}</p>
                        </div>
                    </div>
                    <p className="mt-6 text-xs text-[var(--muted)]">Identitas Anda terhubung dengan akun Google. Tidak ada password SIPP.</p>
                </div>
                <section className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--line)] bg-white p-5"><div><h2 className="font-semibold">Aktivitas akun</h2><p className="mt-1 text-sm text-[var(--muted)]">Lihat perkembangan pengaduan dan informasi yang Anda terima.</p></div><div className="flex flex-wrap gap-2"><Link href="/warga/pengaduan" className="ui-button ui-button-secondary">Riwayat pengaduan</Link><Link href="/warga/notifikasi" className="ui-button ui-button-secondary">Notifikasi</Link></div></section>
            </div>
        </DashboardShell>
    );
}

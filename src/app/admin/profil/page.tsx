import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfilePhotoForm } from "@/components/profile-photo-form";
import { AdminPasswordForm } from "@/components/admin-password-form";
import { DashboardShell } from "@/components/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    if (session.user.role !== "ADMIN_KELURAHAN") redirect("/warga");

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { username: true, name: true, email: true, image: true } });

    return (
        <DashboardShell role="admin" userName={user?.name ?? "Admin Kelurahan"}>
            <div className="mx-auto max-w-2xl">
                <h1 className="text-2xl font-extrabold text-[var(--ink)]">Profil Admin</h1>

                <div className="mt-6 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
                    <ProfilePhotoForm imageUrl={user?.image ?? null} name={user?.name ?? "A"} />
                    <div className="mt-6 grid gap-4 border-t border-[var(--line)] pt-6 sm:grid-cols-2">
                        <div>
                            <p className="text-sm font-semibold text-[var(--muted)]">Username</p>
                            <p className="mt-1 font-bold text-[var(--ink)]">{user?.username ?? "—"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-[var(--muted)]">Nama</p>
                            <p className="mt-1 font-bold text-[var(--ink)]">{user?.name ?? "—"}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-extrabold text-[var(--ink)]">Ganti password</h2>
                    <AdminPasswordForm />
                </div>
            </div>
        </DashboardShell>
    );
}

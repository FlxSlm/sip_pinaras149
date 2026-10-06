import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { CmsEditor } from "@/components/cms-editor";
import { DashboardShell } from "@/components/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    if (session.user.role !== "ADMIN_KELURAHAN") redirect("/warga");

    return (
        <DashboardShell role="admin" userName={session.user.name ?? session.user.email ?? "Admin Kelurahan"}>
            <div className="mx-auto max-w-5xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-extrabold text-[var(--ink)]">Konten Landing Page</h1>
                    <p className="mt-1 text-sm text-[var(--muted)]">Kelola konten yang tampil di halaman utama. Perubahan langsung terlihat tanpa perlu deploy ulang.</p>
                </div>
                <CmsEditor />
            </div>
        </DashboardShell>
    );
}

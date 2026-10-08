import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ComplaintForm } from "@/components/complaint-form";
import { DashboardShell } from "@/components/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function WargaCreatePage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    if (session.user.role !== "WARGA") redirect("/admin");

    return (
        <DashboardShell role="warga" userName={session.user.name ?? session.user.email ?? "Warga"}>
            <div className="mx-auto max-w-2xl">
                <h1 className="text-2xl font-extrabold text-[var(--ink)]">Buat pengaduan</h1>
                <p className="mt-1 text-sm text-[var(--muted)]">Pengaduan Anda akan diteruskan kepada Admin Kelurahan untuk ditindaklanjuti.</p>
                <div className="mt-6 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm">
                    <ComplaintForm />
                </div>
            </div>
        </DashboardShell>
    );
}

import { getDashboardSession } from "@/lib/dashboard-session";
import { redirect } from "next/navigation";
import { StructureEditor } from "@/components/structure-editor";
import { getOrganization } from "@/lib/organization-store";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
    const session = await getDashboardSession();
    if (!session) redirect("/login");
    if (session.user.role !== "ADMIN_KELURAHAN") redirect("/warga");
    const { publicMembers } = await getOrganization();

    return (
        <>
            <div className="mx-auto max-w-5xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-extrabold text-[var(--ink)]">Struktur Kelurahan</h1>
                    <p className="mt-1 text-sm text-[var(--muted)]">Perbarui nama dan foto pejabat. Perubahan tampil pada struktur di portal publik.</p>
                </div>
                <StructureEditor initialMembers={publicMembers} />
            </div>
        </>
    );
}

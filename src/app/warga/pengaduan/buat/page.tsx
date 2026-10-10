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
            <div className="mx-auto max-w-6xl">
                <h1 className="text-2xl font-extrabold text-[var(--ink)]">Buat pengaduan</h1>
                <p className="mt-1 text-sm text-[var(--muted)]">Pengaduan Anda akan diteruskan kepada Admin Kelurahan untuk ditindaklanjuti.</p>
                <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_17rem]">
                <div className="min-w-0 rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6 shadow-sm">
                    <ComplaintForm />
                </div>
                <aside className="rounded-xl border border-[var(--line)] bg-white p-5"><h2 className="text-lg font-semibold">Sebelum mengirim</h2><ul className="mt-3 list-disc space-y-3 pl-5 text-sm leading-6 text-[var(--muted)]"><li>Tulis permasalahan secara jelas dan sesuai kejadian.</li><li>Sertakan lokasi atau patokan yang mudah ditemukan.</li><li>Foto bukti bersifat privat; hanya Anda dan admin yang dapat melihatnya.</li><li>Anda akan diminta memeriksa kembali pengaduan sebelum dikirim.</li></ul><p className="mt-4 border-t border-[var(--line)] pt-4 text-sm leading-6">Setelah terkirim, pantau status dan tanggapan melalui riwayat pengaduan.</p></aside>
                </div>
            </div>
        </DashboardShell>
    );
}

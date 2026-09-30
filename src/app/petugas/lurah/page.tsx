import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { authOptions } from "@/lib/auth";

export default async function LurahPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
    if (session.user.role !== "lurah") redirect("/petugas");

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
            </div>
        </main>
    );
}
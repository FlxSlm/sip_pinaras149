import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { LogoutButton } from "@/components/logout-button";
import { NotificationBell } from "@/components/notification-bell";

type DashboardRole = "warga" | "admin";

const icon = {
    dashboard: <path d="M3 13h8V3H3v10Zm10 8h8V11h-8v10ZM3 21h8v-6H3v6Zm10-18v6h8V3h-8Z" />,
    complaint: <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-9 14H7v-2h3v2Zm0-4H7v-2h3v2Zm0-4H7V7h3v2Zm6 8h-4v-2h4v2Zm0-4h-4v-2h4v2Zm0-4h-4V7h4v2Z" />,
    announce: <path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2Z" />,
    profile: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" />,
    history: <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89L8.78 12H6a7 7 0 1 1 7 7v2a9 9 0 0 0 0-18ZM12 8v5l4.28 2.54.72-1.21-3.5-2.08V8H12Z" />,
    content: <path d="M4 4h7l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />,
};

function MenuIcon({ d }: { d: ReactNode }) {
    return (
        <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
            {d}
        </svg>
    );
}

export function DashboardShell({ role, userName, location, children }: { role: DashboardRole; userName: string; location?: string; children: ReactNode }) {
    const isAdmin = role === "admin";
    const basePath = isAdmin ? "/admin" : "/warga";
    const roleLabel = isAdmin ? "Admin Kelurahan" : "Warga Pinaras";

    const menu = isAdmin
        ? [
            { label: "Dashboard", href: basePath, icon: icon.dashboard },
            { label: "Pengaduan", href: `${basePath}#pengaduan`, icon: icon.complaint },
            { label: "Pengumuman", href: "/pengumuman", icon: icon.announce },
            { label: "Konten Landing Page", href: "/admin/konten", icon: icon.content },
            { label: "Profil", href: `${basePath}#profil`, icon: icon.profile },
        ]
        : [
            { label: "Dashboard", href: basePath, icon: icon.dashboard },
            { label: "Buat Pengaduan", href: `${basePath}#buat`, icon: icon.complaint },
            { label: "Riwayat Pengaduan", href: `${basePath}#riwayat`, icon: icon.history },
            { label: "Pengumuman", href: "/pengumuman", icon: icon.announce },
            { label: "Profil", href: `${basePath}#profil`, icon: icon.profile },
        ];

    return (
        <div className="flex min-h-screen bg-[var(--surface)]">
            <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-[var(--brand-deep)] px-4 py-6 text-white lg:flex">
                <Link href={basePath} className="flex items-center gap-3 px-2">
                    <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-[var(--leaf)] to-[var(--brand)] text-lg font-black text-white">P</div>
                    <div>
                        <p className="text-lg font-extrabold leading-tight">SIP Pinaras</p>
                        <p className="text-[11px] leading-tight text-white/60">Kelurahan Pinaras</p>
                    </div>
                </Link>

                <div className="mt-6 rounded-xl bg-white/5 px-3 py-2.5">
                    <p className="text-xs text-white/55">Anda masuk sebagai</p>
                    <p className="mt-0.5 text-sm font-bold">{roleLabel}</p>
                </div>

                <nav className="mt-6 space-y-1">
                    {menu.map((item, index) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${index === 0 ? "bg-[var(--leaf)] text-white shadow-lg shadow-black/20" : "text-white/75 hover:bg-white/10 hover:text-white"}`}
                        >
                            <MenuIcon d={item.icon} />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto overflow-hidden rounded-2xl border border-white/10">
                    <div className="relative aspect-[4/3]">
                        <Image src="/images/panorama-pinaras.png" alt="" fill sizes="240px" className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,63,92,0.85)] to-transparent" />
                    </div>
                    <div className="bg-[var(--brand-deep)] p-4">
                        <p className="text-sm italic text-white/90">Bersama kita wujudkan Pinaras yang lebih baik.</p>
                    </div>
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-[var(--line)] bg-white/95 px-4 backdrop-blur lg:px-8">
                    <div className="flex items-center gap-3 lg:hidden">
                        <div className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-[var(--leaf)] to-[var(--brand)] text-sm font-black text-white">P</div>
                        <p className="font-extrabold text-[var(--ink)]">SIP Pinaras</p>
                    </div>
                    <div className="hidden max-w-xl flex-1 items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--muted)] lg:flex">
                        <span aria-hidden="true">⌕</span>
                        <span>Cari pengaduan, nama warga, atau nomor tiket…</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <NotificationBell />
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-bold text-[var(--ink)]">{userName}</p>
                            <p className="text-xs text-[var(--muted)]">{location ?? roleLabel}</p>
                        </div>
                        <LogoutButton />
                    </div>
                </header>

                <div className="flex-1 px-4 py-6 lg:px-8">
                    <section className="relative mb-6 overflow-hidden rounded-2xl bg-[var(--brand-deep)] text-white shadow-[0_14px_40px_rgba(18,50,59,0.18)]">
                        <Image src="/images/panorama-pinaras.png" alt="Panorama Kelurahan Pinaras" fill priority sizes="(max-width: 1024px) 100vw, 80vw" className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,63,92,0.92)] via-[rgba(10,63,92,0.7)] to-[rgba(31,157,107,0.35)]" />
                        <div className="relative px-6 py-10 sm:px-10">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Kelurahan Pinaras · Tomohon Selatan</p>
                            <h1 className="mt-3 max-w-2xl text-3xl font-extrabold sm:text-4xl">Selamat datang, {userName}</h1>
                            <p className="mt-3 max-w-xl text-sm leading-6 text-white/85">Kelola informasi dan pengaduan warga dengan cepat, terarah, dan transparan.</p>
                        </div>
                    </section>
                    {children}
                </div>
            </div>
        </div>
    );
}

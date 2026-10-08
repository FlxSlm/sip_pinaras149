"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { LogoutButton } from "@/components/logout-button";
import { NotificationBell } from "@/components/notification-bell";

type DashboardRole = "warga" | "admin";

const icon = {
    dashboard: <path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm8 0h6v-9h-6v9Zm0-16v5h6V4h-6Z" />,
    complaint: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm4 18H6V4h7v5h5v11Zm-3-7H9v-2h6v2Zm0 4H9v-2h6v2Z" />,
    create: <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2Z" />,
    announce: <path d="M18 11c0-1-.7-1.8-1.6-2l.4-1.3a3 3 0 0 0-2-3.6L12 3l-2.8 1.1a3 3 0 0 0-2 3.6l.4 1.3C6.7 9.2 6 10 6 11v5l-2 2v1h16v-1l-2-2v-5ZM12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Z" />,
    notif: <path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2Zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2Z" />,
    profile: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" />,
    history: <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89L8.78 12H6a7 7 0 1 1 7 7v2a9 9 0 0 0 0-18ZM12 8v5l4.28 2.54.72-1.21-3.5-2.08V8H12Z" />,
    content: <path d="M4 4h7l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />,
};

function MenuIcon({ d }: { d: ReactNode }) {
    return (
        <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="currentColor" aria-hidden="true">
            {d}
        </svg>
    );
}

function isActive(pathname: string, href: string, isRoot: boolean): boolean {
    if (isRoot) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardShell({ role, userName, children }: { role: DashboardRole; userName: string; children: ReactNode }) {
    const pathname = usePathname();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [account, setAccount] = useState<{ name: string | null; email: string | null; username: string | null; image: string | null } | null>(null);

    useEffect(() => {
        let active = true;
        fetch("/api/me", { cache: "no-store" })
            .then((response) => response.ok ? response.json() as Promise<{ name: string | null; email: string | null; username: string | null; image: string | null }> : null)
            .then((result) => {
                if (active && result) setAccount(result);
            })
            .catch(() => undefined);
        return () => {
            active = false;
        };
    }, []);

    const isAdmin = role === "admin";
    const basePath = isAdmin ? "/admin" : "/warga";
    const notificationsHref = isAdmin ? "/admin/notifikasi" : "/warga/notifikasi";

    const menu = isAdmin
        ? [
            { key: "dashboard", label: "Dashboard", href: "/admin", icon: icon.dashboard },
            { key: "pengaduan", label: "Pengaduan", href: "/admin/pengaduan", icon: icon.complaint },
            { key: "pengumuman", label: "Pengumuman", href: "/admin/pengumuman", icon: icon.announce },
            { key: "konten", label: "Konten Landing Page", href: "/admin/konten", icon: icon.content },
            { key: "profil", label: "Profil", href: "/admin/profil", icon: icon.profile },
        ]
        : [
            { key: "dashboard", label: "Dashboard", href: "/warga", icon: icon.dashboard },
            { key: "riwayat", label: "Riwayat Pengaduan", href: "/warga/pengaduan", icon: icon.history },
            { key: "buat", label: "Buat Pengaduan", href: "/warga/pengaduan/buat", icon: icon.create },
            { key: "notif", label: "Notifikasi", href: "/warga/notifikasi", icon: icon.notif },
            { key: "profil", label: "Profil", href: "/warga/profil", icon: icon.profile },
        ];

    const displayName = account?.name ?? userName;
    const subLine = isAdmin ? (account?.username ?? "admin.pinaras") : (account?.email ?? "");

    const sidebar = (
        <aside className="sidebar-bg flex h-full w-[250px] shrink-0 flex-col text-white">
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-5">
                <Image src="/images/logo tomohon.png" alt="Logo" width={40} height={40} className="size-10 shrink-0 object-contain" />
                <div>
                    <p className="text-base font-bold leading-tight tracking-wide">SIPP PINARAS</p>
                    <p className="text-[11px] leading-tight text-white/60">Sistem Informasi Pengaduan Publik</p>
                    <p className="text-[10px] leading-tight text-white/50">Kelurahan Pinaras</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="mt-2 flex-1 space-y-1 px-3">
                {menu.map((item) => {
                    const active = isActive(pathname, item.href, item.key === "dashboard");
                    return (
                        <Link
                            key={item.key}
                            href={item.href}
                            onClick={() => setDrawerOpen(false)}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${active ? "bg-[var(--leaf)] font-semibold text-white shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
                        >
                            <MenuIcon d={item.icon} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Account area */}
            <div className="mx-3 mb-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/8 p-3">
                <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-white/20">
                    {account?.image ? (
                        <Image src={account.image} alt="" fill sizes="40px" className="object-cover" />
                    ) : (
                        <span className="grid size-full place-items-center text-sm font-bold text-white">{(displayName || "P").slice(0, 1).toUpperCase()}</span>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                    <p className="truncate text-[11px] text-white/55">{subLine}</p>
                    {!isAdmin && <p className="mt-0.5 flex items-center gap-1 text-[10px] text-white/45"><Image src="/images/google-logo.jpg" alt="" width={12} height={12} className="size-3 rounded-full" />Login dengan Google</p>}
                </div>
                <Link href={isAdmin ? "/admin/profil" : "/warga/profil"} aria-label="Profil" className="text-white/50 hover:text-white">
                    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6Z" /></svg>
                </Link>
            </div>
        </aside>
    );

    return (
        <div className="flex min-h-screen bg-[var(--surface)]">
            {/* Desktop sidebar */}
            <div className="sticky top-0 hidden h-screen lg:block">{sidebar}</div>

            {/* Mobile drawer */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
                    <div className="absolute left-0 top-0 h-full shadow-2xl">{sidebar}</div>
                </div>
            )}

            {/* Main content */}
            <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
                {/* Top header */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[var(--line)] bg-white px-4 lg:px-8">
                    <div className="flex items-center gap-3">
                        <button type="button" aria-label="Buka menu" onClick={() => setDrawerOpen(true)} className="rounded-lg border border-[var(--line)] p-2 lg:hidden">
                            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor"><path d="M3 6h18v2H3V6Zm0 5h18v2H3v-2Zm0 5h18v2H3v-2Z" /></svg>
                        </button>
                        <Link href={basePath} className="flex items-center gap-2 lg:hidden">
                            <Image src="/images/logo tomohon.png" alt="Logo" width={28} height={28} className="size-7 rounded object-contain" />
                            <span className="text-sm font-bold text-[var(--ink)]">SIPP PINARAS</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell href={notificationsHref} />
                        <div className="flex items-center gap-3">
                            <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-[var(--surface-2)]">
                                {account?.image ? (
                                    <Image src={account.image} alt="" fill sizes="36px" className="object-cover" />
                                ) : (
                                    <span className="grid size-full place-items-center text-sm font-bold text-[var(--brand)]">{(displayName || "P").slice(0, 1).toUpperCase()}</span>
                                )}
                            </div>
                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-semibold text-[var(--ink)]">{displayName}</p>
                                <p className="text-[11px] text-[var(--muted)]">{subLine}</p>
                            </div>
                            <LogoutButton />
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 px-4 py-6 lg:px-8">
                    {children}
                </main>

                {/* Footer */}
                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] bg-white px-4 py-3 text-[11px] text-[var(--muted)] lg:px-8">
                    <p className="flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" /></svg>
                        {isAdmin ? "SIPP PINARAS · Kelurahan Pinaras, Kecamatan Tomohon Selatan, Kota Tomohon" : "Kelurahan Pinaras, Kecamatan Tomohon Selatan, Kota Tomohon"}
                    </p>
                    <p className="italic">
                        {isAdmin ? "Bersama Membangun Pinaras yang Lebih Baik 🌿" : "SIPP PINARAS — Bersama Membangun Pinaras yang Lebih Baik 🌿"}
                    </p>
                </footer>
            </div>
        </div>
    );
}

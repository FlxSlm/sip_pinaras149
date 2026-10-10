"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState, type ReactNode } from "react";
import { LogoutButton } from "@/components/logout-button";
import { NotificationBell } from "@/components/notification-bell";
import { Dialog } from "@/components/ui/dialog";
import { Icon, type IconName } from "@/components/ui/icon";
import { Button } from "@/components/ui/primitives";
import { Avatar } from "@/components/avatar";

type DashboardRole = "warga" | "admin";
type MenuItem = { label: string; href: string; icon: IconName };
type Account = { name: string | null; email: string | null; username: string | null; image: string | null };

const menus: Record<DashboardRole, MenuItem[]> = {
    warga: [
        { label: "Dashboard", href: "/warga", icon: "dashboard" },
        { label: "Riwayat Pengaduan", href: "/warga/pengaduan", icon: "history" },
        { label: "Buat Pengaduan", href: "/warga/pengaduan/buat", icon: "plus" },
        { label: "Notifikasi", href: "/warga/notifikasi", icon: "bell" },
        { label: "Profil", href: "/warga/profil", icon: "profile" },
    ],
    admin: [
        { label: "Dashboard", href: "/admin", icon: "dashboard" },
        { label: "Pengaduan", href: "/admin/pengaduan", icon: "complaint" },
        { label: "Pengumuman", href: "/admin/pengumuman", icon: "announcement" },
        { label: "Konten Kelurahan", href: "/admin/konten", icon: "content" },
        { label: "Profil", href: "/admin/profil", icon: "profile" },
    ],
};

function isActive(pathname: string, href: string, basePath: string): boolean {
    if (href === basePath) return pathname === href;
    if (href === "/warga/pengaduan" && pathname.startsWith("/warga/pengaduan/buat")) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardShell({ role, userName, children }: { role: DashboardRole; userName: string; children: ReactNode }) {
    const pathname = usePathname();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [account, setAccount] = useState<Account | null>(null);
    const drawerId = useId();

    useEffect(() => {
        let active = true;
        fetch("/api/me", { cache: "no-store" })
            .then((response) => response.ok ? response.json() as Promise<Account> : null)
            .then((result) => { if (active && result) setAccount(result); })
            .catch(() => undefined);
        return () => { active = false; };
    }, []);

    useEffect(() => {
        const desktop = window.matchMedia("(min-width: 1024px)");
        const closeOnDesktop = () => { if (desktop.matches) setDrawerOpen(false); };
        desktop.addEventListener("change", closeOnDesktop);
        return () => desktop.removeEventListener("change", closeOnDesktop);
    }, []);

    const isAdmin = role === "admin";
    const basePath = isAdmin ? "/admin" : "/warga";
    const notificationsHref = `${basePath}/notifikasi`;
    const displayName = account?.name ?? userName;
    const subLine = isAdmin ? (account?.username ?? "Admin Kelurahan") : (account?.email ?? "Akun warga");
    const currentPage = menus[role].find((item) => isActive(pathname, item.href, basePath))?.label ?? "Notifikasi";

    function avatar(size: "small" | "large") {
        return (
            <Avatar src={account?.image} name={displayName} className={size === "large" ? "size-11" : "size-10"} />
        );
    }

    function sidebar(mobile = false) {
        return (
            <aside className={`sidebar-bg flex flex-col text-white ${mobile ? "h-full w-full" : "dashboard-sidebar"}`}>
                <div className="flex items-center gap-3 px-5 pb-7 pt-7">
                    <Link href={basePath} onClick={() => setDrawerOpen(false)} className="flex min-w-0 flex-1 items-center gap-3">
                        <Image src="/images/logo tomohon.png" alt="Logo Kota Tomohon" width={44} height={44} className="size-11 shrink-0 object-contain" />
                        <div className="min-w-0">
                            <p className="text-lg font-bold tracking-wide">SIPP PINARAS</p>
                            <p className="mt-1 text-xs leading-5 text-white/80">Sistem Informasi Peduli Pinaras</p>
                            <p className="text-xs text-white/80">Kelurahan Pinaras</p>
                        </div>
                    </Link>
                    {mobile && <button type="button" autoFocus aria-label="Tutup menu" onClick={() => setDrawerOpen(false)} className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 hover:bg-white/20"><Icon name="close" /></button>}
                </div>
                <nav aria-label={isAdmin ? "Navigasi admin kelurahan" : "Navigasi warga"} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 pb-6">
                    {menus[role].map((item) => (
                        <Link key={item.href} href={item.href} aria-current={isActive(pathname, item.href, basePath) ? "page" : undefined} onClick={() => setDrawerOpen(false)} className="dashboard-nav-link flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 hover:text-white">
                            <Icon name={item.icon} className="size-5" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                    <div className="pt-5">
                        <Link href="/" className="flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/10"><Icon name="arrow" />Portal kelurahan</Link>
                    </div>
                </nav>
                <Link href={`${basePath}/profil`} onClick={() => setDrawerOpen(false)} className="mx-3 mb-5 flex items-center gap-3 rounded-xl border border-white/15 bg-[rgb(3_43_70/80%)] p-4 text-white hover:bg-[var(--brand-deep)]">
                    {avatar("large")}
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{displayName}</p>
                        <p className="mt-0.5 truncate text-xs text-white/80">{subLine}</p>
                        {!isAdmin && <p className="mt-1 text-xs text-white/80">Login dengan Google</p>}
                    </div>
                    <Icon name="chevron" className="size-4" />
                </Link>
            </aside>
        );
    }

    return (
        <div className="flex min-h-dvh bg-[var(--surface)]">
            <a href="#dashboard-content" className="skip-link">Lewati navigasi</a>
            <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar()}</div>
            {drawerOpen && (
                <Dialog labelledBy={drawerId} drawer onClose={() => setDrawerOpen(false)}>
                    <h2 id={drawerId} className="sr-only">Menu SIPP {isAdmin ? "admin kelurahan" : "warga"}</h2>
                    {sidebar(true)}
                </Dialog>
            )}
            <div className="flex min-w-0 flex-1 flex-col lg:ml-[var(--sidebar-width)]">
                <header className="dashboard-header sticky top-0 z-30 flex min-h-[72px] items-center justify-between gap-2 border-b border-[var(--line)] px-4 sm:gap-4 sm:px-6 xl:px-8">
                    <div className="flex min-w-0 items-center gap-3">
                        <Button variant="secondary" aria-label="Buka menu" aria-expanded={drawerOpen} aria-haspopup="dialog" onClick={() => setDrawerOpen(true)} className="size-11 shrink-0 p-0 lg:hidden"><Icon name="menu" /></Button>
                        <Link href={basePath} className="text-sm font-bold lg:hidden">SIPP</Link>
                        <div className="hidden min-w-0 lg:block">
                            <p className="text-xs text-[var(--muted)]">Ruang {isAdmin ? "Admin Kelurahan" : "Warga"}</p>
                            <p className="truncate text-sm font-semibold">{currentPage}</p>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                        <NotificationBell href={notificationsHref} />
                        <Link href={`${basePath}/profil`} aria-label={`Profil ${displayName}`} className="flex min-h-11 items-center gap-3 rounded-xl">
                            {avatar("small")}
                            <div className="hidden max-w-36 text-left sm:block xl:max-w-52">
                                <p className="truncate text-sm font-semibold">{displayName}</p>
                                <p className="truncate text-xs text-[var(--muted)]">{isAdmin ? "Admin Kelurahan" : "Warga Pinaras"}</p>
                            </div>
                        </Link>
                        <LogoutButton />
                    </div>
                </header>
                <main id="dashboard-content" tabIndex={-1} className="dashboard-main min-w-0 flex-1 px-4 py-6 sm:px-6 xl:px-8">
                    {children}
                </main>
                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] bg-white/60 px-4 py-5 text-xs leading-5 text-[var(--muted)] sm:px-6 xl:px-8">
                    <p className="flex items-start gap-2"><Icon name="location" className="mt-0.5 size-4" /><span>Kelurahan Pinaras, Kecamatan Tomohon Selatan, Kota Tomohon</span></p>
                    <p className="flex items-center gap-2"><span>Bersama Membangun Pinaras yang Lebih Baik</span><Icon name="leaf" className="size-4" /></p>
                </footer>
            </div>
        </div>
    );
}

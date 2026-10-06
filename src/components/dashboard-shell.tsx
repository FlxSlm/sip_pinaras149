import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { LogoutButton } from "@/components/logout-button";
import { NotificationBell } from "@/components/notification-bell";

type DashboardRole = "warga" | "kepala_lingkungan" | "lurah";

const menuByRole: Record<DashboardRole, Array<[string, string, string]>> = {
    warga: [["Dashboard", "/warga", "⌂"], ["Buat Pengaduan", "/warga#buat-pengaduan", "+"], ["Pengaduan Saya", "/warga#pengaduan-saya", "▤"], ["Profil Saya", "/warga#profil-saya", "♙"], ["Pengumuman", "/pengumuman", "!"], ["Pengaturan", "/warga#pengaturan", "⚙"]],
    kepala_lingkungan: [["Dashboard", "/petugas/lingkungan", "⌂"], ["Pengaduan", "/petugas/lingkungan#pengaduan", "▤"], ["Pengumuman", "/pengumuman", "!"], ["Laporan & Statistik", "/petugas/lingkungan#statistik", "▥"], ["Profil", "/petugas/lingkungan#profil", "♙"], ["Pengaturan", "/petugas/lingkungan#pengaturan", "⚙"]],
    lurah: [["Dashboard", "/petugas/lurah", "⌂"], ["Pengaduan", "/petugas/lurah#pengaduan", "▤"], ["Pengumuman", "/pengumuman", "!"], ["Laporan & Statistik", "/petugas/lurah#statistik", "▥"], ["Profil", "/petugas/lurah#profil", "♙"], ["Pengaturan", "/petugas/lurah#pengaturan", "⚙"]],
};

const roleLabel: Record<DashboardRole, string> = { warga: "Warga Pinaras", kepala_lingkungan: "Kepala Lingkungan", lurah: "Lurah Pinaras" };

export function DashboardShell({ role, userName, location, children }: { role: DashboardRole; userName: string; location?: string; children: ReactNode }) {
    return <main className="min-h-screen bg-[#f5f8fc] text-[#173b68]">
        <aside className="dashboard-sidebar fixed inset-y-0 left-0 z-30 flex w-[244px] flex-col bg-[#102b50] px-4 py-5 text-white">
            <Link href={role === "warga" ? "/warga" : role === "lurah" ? "/petugas/lurah" : "/petugas/lingkungan"} className="flex items-center gap-3 px-2 pb-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-2xl font-black text-[#173b68]">P</div>
                <div><p className="text-xl font-bold tracking-wide">SIPP</p><p className="text-xs leading-4 text-white/75">Sistem Informasi<br />Peduli Pinaras</p></div>
            </Link>
            <nav className="space-y-2">{menuByRole[role].map(([label, href, icon], index) => <Link key={label} href={href} className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold ${index === 0 ? "bg-[#2f83ed] text-white shadow-lg shadow-blue-950/20" : "text-white/80 hover:bg-white/10 hover:text-white"}`}><span className="flex w-5 justify-center text-lg">{icon}</span>{label}</Link>)}</nav>
            <div className="mt-auto rounded-xl bg-[url('/images/panorama-pinaras.png')] bg-cover bg-center p-4"><div className="rounded-lg bg-[#102b50]/75 p-3"><p className="font-serif text-lg italic text-white">Bersama Kita Wujudkan Pinaras yang Lebih Baik</p></div></div>
        </aside>
        <div className="dashboard-content min-h-screen">
            <header className="flex h-[70px] items-center justify-between gap-4 border-b border-[#e3eaf3] bg-white px-5 lg:px-8"><button type="button" className="rounded-lg border border-[#e0e9f4] px-3 py-2 text-xl text-[#173b68]" aria-label="Menu">☰</button><div className="hidden max-w-xl flex-1 items-center rounded-lg border border-[#dbe6f3] bg-[#f7faff] px-4 py-2.5 text-sm text-[#7890ae] md:flex">⌕ <span className="ml-3">Cari pengaduan, nama warga, atau nomor tiket...</span></div><div className="flex items-center gap-3"><NotificationBell /><div className="hidden text-right sm:block"><p className="text-sm font-bold text-[#173b68]">{userName}</p><p className="text-xs text-[#7290b5]">{location ?? roleLabel[role]}</p></div><LogoutButton /></div></header>
            <div className="px-4 py-5 sm:px-6 lg:px-8"><section className="relative overflow-hidden rounded-xl bg-[#173b68] text-white shadow-sm"><Image src="/images/panorama-pinaras.png" alt="Panorama Kelurahan Pinaras" fill priority sizes="(max-width: 1024px) 100vw, 80vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-[#102b50]/90 via-[#173b68]/60 to-[#173b68]/20" /><div className="relative min-h-[220px] p-7 sm:p-10"><p className="text-sm font-semibold text-blue-100">Kelurahan Pinaras · Kecamatan Tomohon Selatan</p><h1 className="mt-4 max-w-2xl text-3xl font-bold sm:text-4xl">Selamat datang, {userName}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-white/85">Kelola informasi dan pengaduan warga dengan cepat, terarah, dan transparan.</p></div></section>{children}</div>
        </div>
    </main>;
}

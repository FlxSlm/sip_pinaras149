"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Button, buttonClassName } from "@/components/ui/primitives";

const links = [
  { label: "Beranda", href: "/" },
  { label: "Profil", href: "/#profil" },
  { label: "Potensi", href: "/#potensi" },
  { label: "Layanan", href: "/#layanan" },
  { label: "Pengumuman", href: "/pengumuman" },
  { label: "Forum Pengaduan", href: "/pengaduan" },
];

export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const id = useId();

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  function navigation(mobile = false) {
    return (
      <nav aria-label={mobile ? "Navigasi publik mobile" : "Navigasi publik"} className={mobile ? "grid gap-2" : "hidden items-center gap-4 xl:flex"}>
        {links.map((item) => {
          const active = !item.href.includes("#") && (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href));
          return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)} className={`flex min-h-11 items-center border-b-2 text-sm font-medium ${mobile ? "rounded-lg px-3" : "px-0"} ${active ? "border-[var(--leaf)] text-[var(--leaf-dark)]" : "border-transparent text-[var(--ink)] hover:text-[var(--leaf-dark)]"}`}>{item.label}</Link>;
        })}
      </nav>
    );
  }

  return (
    <>
      <a href="#public-content" className="skip-link">Lewati navigasi</a>
      <header className="dashboard-header sticky top-0 z-40 border-b border-[var(--line)]">
        <div className="public-container flex min-h-[76px] items-center justify-between gap-3">
          <Link href="/" aria-label="SIPP Pinaras, beranda" className="flex min-w-0 items-center gap-2.5">
            <Image src="/images/logo tomohon.png" alt="Logo Kota Tomohon" width={38} height={38} className="size-9 shrink-0 object-contain" />
            <div className="min-w-0">
              <p className="text-sm font-bold tracking-tight sm:text-base">SIPP PINARAS</p>
              <p className="hidden text-xs text-[var(--muted)] sm:block">Sistem Informasi Peduli Pinaras</p>
            </div>
          </Link>
          {navigation()}
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/login" className={buttonClassName("success", "rounded-full px-4")}>Masuk</Link>
            <Button variant="secondary" aria-label="Buka navigasi" aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen(true)} className="size-11 p-0 xl:hidden"><Icon name="menu" /></Button>
          </div>
        </div>
      </header>
      {open && (
        <Dialog labelledBy={id} onClose={() => setOpen(false)}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 id={id} className="text-lg font-semibold">Jelajahi SIPP Pinaras</h2>
            <Button variant="ghost" autoFocus aria-label="Tutup navigasi" onClick={() => setOpen(false)} className="size-11 p-0"><Icon name="close" /></Button>
          </div>
          {navigation(true)}
        </Dialog>
      )}
    </>
  );
}

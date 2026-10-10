import Image from "next/image";
import Link from "next/link";

export function PublicFooter() {
    return <footer className="bg-[var(--brand-deep)] text-white">
        <div className="public-container grid gap-7 py-9 md:grid-cols-[1.4fr_1fr]">
            <div className="flex items-start gap-3"><Image src="/images/logo tomohon.png" alt="Logo Kota Tomohon" width={44} height={44} className="size-11 object-contain" /><div><p className="font-semibold">SIPP PINARAS</p><p className="mt-1 max-w-sm text-sm leading-6 text-white/85">Sistem Informasi Peduli Pinaras</p><p className="mt-1 text-sm text-white/85">Kelurahan Pinaras, Kecamatan Tomohon Selatan, Kota Tomohon</p></div></div>
            <nav aria-label="Navigasi footer" className="flex flex-wrap content-start gap-x-6 gap-y-3 text-sm"><Link href="/">Beranda</Link><Link href="/#profil">Profil kelurahan</Link><Link href="/pengumuman">Pengumuman</Link><Link href="/pengaduan">Forum pengaduan</Link><Link href="/#kontak">Kontak</Link></nav>
        </div>
        <div className="border-t border-white/15"><div className="public-container flex flex-wrap justify-between gap-2 py-4 text-xs text-white/85"><p>© {new Date().getFullYear()} SIPP Kelurahan Pinaras</p><p>Bersama Membangun Pinaras yang Lebih Baik</p></div></div>
    </footer>;
}

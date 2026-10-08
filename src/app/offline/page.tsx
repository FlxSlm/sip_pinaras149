import Link from "next/link";
import Image from "next/image";

export default function OfflinePage() {
    return (
        <main className="grid min-h-screen place-items-center bg-[var(--surface)] px-6 py-12">
            <section className="max-w-md rounded-[2rem] border border-[var(--line)] bg-white p-8 text-center shadow-[0_20px_50px_rgba(20,40,55,0.08)]">
                <Image src="/images/logo tomohon.png" alt="Logo Tomohon" width={56} height={54} className="mx-auto size-14 rounded-lg object-contain" />
                <p className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-[var(--accent)]">SIP Pinaras</p>
                <h1 className="mt-4 text-3xl font-bold text-[var(--ink)]">Anda sedang offline</h1>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Halaman publik akan tersedia kembali setelah koneksi internet tersambung.</p>
                <Link href="/" className="mt-6 inline-block rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white">Kembali ke beranda</Link>
            </section>
        </main>
    );
}
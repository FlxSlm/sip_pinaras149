import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--surface)]">
      <header className="border-b border-[var(--line)] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              Kelurahan Pinaras
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--ink)]">SIP Pinaras</p>
          </div>
          <Link href="/login" className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white">
            Masuk ke layanan
          </Link>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Sistem Informasi Peduli Pinaras
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] text-[var(--ink)] sm:text-6xl">
            Layanan informasi kelurahan yang dekat dengan warga.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Akses layanan informasi dan pengaduan Kelurahan Pinaras dari satu portal. Warga dapat masuk untuk membuat pengaduan, sementara petugas memprosesnya sesuai lingkungan kerja.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className="rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white">Buat pengaduan</Link>
            <a href="#layanan" className="rounded-md border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)]">Lihat layanan</a>
          </div>
        </div>
        <div id="layanan" className="mt-16 grid gap-5 border-t border-[var(--line)] pt-6 sm:grid-cols-3">
          <div className="rounded-lg border border-[var(--line)] bg-white p-5">
            <p className="text-sm font-semibold text-[var(--ink)]">Pengaduan warga</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Kirim laporan dengan kategori, lingkungan, deskripsi, dan foto bukti.</p>
            <Link href="/login" className="mt-4 inline-block text-sm font-semibold text-[var(--accent)]">Masuk untuk mengadu</Link>
          </div>
          <div className="rounded-lg border border-[var(--line)] bg-white p-5">
            <p className="text-sm font-semibold text-[var(--ink)]">Proses terarah</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Pengaduan diterima Kepala Lingkungan lalu diteruskan kepada Lurah.</p>
            <span className="mt-4 inline-block text-sm text-[var(--muted)]">Warga → Kepala Lingkungan → Lurah</span>
          </div>
          <div className="rounded-lg border border-[var(--line)] bg-white p-5">
            <p className="text-sm font-semibold text-[var(--ink)]">Akses petugas</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Petugas masuk dengan akun aplikasi untuk melihat pekerjaan sesuai kewenangannya.</p>
            <Link href="/login" className="mt-4 inline-block text-sm font-semibold text-[var(--accent)]">Masuk sebagai petugas</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

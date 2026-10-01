import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--surface)]">
      <header className="bg-[var(--ink)] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f2c84b]">
              Kelurahan Pinaras
            </p>
            <p className="mt-1 text-lg font-bold">SIP Pinaras</p>
          </div>
          <Link href="/login" className="rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white">
            Masuk ke layanan
          </Link>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20 lg:py-24">
        <div className="grid items-end gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--accent)]">
              Sistem Informasi Peduli Pinaras
            </p>
            <h1 className="mt-5 max-w-3xl text-5xl font-bold leading-[1.02] text-[var(--ink)] sm:text-6xl">
              Layanan informasi kelurahan yang dekat dengan warga.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Akses layanan informasi dan pengaduan Kelurahan Pinaras dari satu portal. Warga dapat masuk untuk membuat pengaduan, sementara petugas memprosesnya sesuai lingkungan kerja.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white shadow-sm">Buat pengaduan</Link>
              <a href="#layanan" className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-bold text-[var(--ink)]">Lihat layanan</a>
            </div>
          </div>
          <div className="rounded-[2rem] bg-[var(--ink)] p-7 text-white shadow-[0_20px_45px_rgba(18,43,58,0.16)] sm:p-9">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#f2c84b]">Pelayanan publik</p>
            <p className="mt-5 text-3xl font-bold leading-tight">Satu tempat untuk menyampaikan, memantau, dan memberi penilaian.</p>
            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/15 pt-5 text-center">
              <div><p className="text-2xl font-bold">01</p><p className="mt-1 text-xs text-white/65">Laporkan</p></div>
              <div><p className="text-2xl font-bold">02</p><p className="mt-1 text-xs text-white/65">Diproses</p></div>
              <div><p className="text-2xl font-bold">03</p><p className="mt-1 text-xs text-white/65">Nilai</p></div>
            </div>
          </div>
        </div>
        <div id="layanan" className="mt-16 grid gap-5 border-t border-[var(--line)] pt-8 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_12px_30px_rgba(20,40,55,0.05)]">
            <p className="text-sm font-bold text-[var(--ink)]">Pengaduan warga</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Kirim laporan dengan kategori, lingkungan, deskripsi, dan foto bukti.</p>
            <Link href="/login" className="mt-4 inline-block text-sm font-semibold text-[var(--accent)]">Masuk untuk mengadu</Link>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_12px_30px_rgba(20,40,55,0.05)]">
            <p className="text-sm font-bold text-[var(--ink)]">Proses terarah</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Pengaduan diterima Kepala Lingkungan lalu diteruskan kepada Lurah.</p>
            <span className="mt-4 inline-block text-sm text-[var(--muted)]">Warga → Kepala Lingkungan → Lurah</span>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_12px_30px_rgba(20,40,55,0.05)]">
            <p className="text-sm font-bold text-[var(--ink)]">Akses petugas</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Petugas masuk dengan akun aplikasi untuk melihat pekerjaan sesuai kewenangannya.</p>
            <Link href="/login" className="mt-4 inline-block text-sm font-semibold text-[var(--accent)]">Masuk sebagai petugas</Link>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-[var(--accent)]">
          <Link href="/pengaduan">Lihat pengaduan terpublikasi</Link>
          <a href="#profil">Profil Kelurahan</a>
          <a href="#sejarah">Sejarah Kelurahan</a>
        </div>
        <div className="mt-10 grid gap-5 border-t border-[var(--line)] pt-10 md:grid-cols-2">
          <section id="profil" className="rounded-lg border border-[var(--line)] bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Profil kelurahan</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">Kelurahan Pinaras</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">SIP Pinaras adalah portal informasi dan pengaduan masyarakat untuk mendukung pelayanan Kelurahan Pinaras. Alur pengaduan mengikuti proses warga, Kepala Lingkungan, lalu Lurah.</p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Informasi layanan, pengumuman, dan pengaduan publik akan dikelola secara bertahap sesuai kewenangan kelurahan.</p>
          </section>
          <section id="sejarah" className="rounded-lg border border-[var(--line)] bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Sejarah</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">Sejarah Kelurahan Pinaras</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Naskah sejarah resmi Kelurahan Pinaras belum tersedia di dokumen project. Bagian ini disiapkan untuk diisi dari dokumen atau keterangan resmi kelurahan agar informasi publik tetap akurat.</p>
          </section>
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import Image from "next/image";

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
          <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] bg-[var(--ink)] shadow-[0_20px_45px_rgba(18,43,58,0.16)]">
            <Image src="/images/panorama-pinaras.png" alt="Panorama Kelurahan Pinaras" fill priority sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
            <div className="absolute inset-0 bg-[rgba(18,43,58,0.48)]" />
            <div className="relative flex min-h-[360px] flex-col justify-end p-7 text-white sm:p-9">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#f2c84b]">Pinaras, Tomohon Selatan</p>
              <p className="mt-4 text-3xl font-bold leading-tight">Ruang informasi warga yang tumbuh dari tempat kita sendiri.</p>
              <p className="mt-4 text-xs text-white/75">Foto panorama lokal · DATA TOMOHON</p>
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
          <Link href="/pengumuman">Lihat pengumuman kelurahan</Link>
          <Link href="/pengaduan">Lihat pengaduan terpublikasi</Link>
          <a href="#profil">Profil Kelurahan</a>
          <a href="#sejarah">Sejarah Kelurahan</a>
        </div>
        <section id="profil" className="mt-10 border-t border-[var(--line)] pt-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Profil kelurahan</p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--ink)]">Mengenal Kelurahan Pinaras</h2>
            <p className="mt-4 text-base leading-7 text-[var(--muted)]">Kelurahan Pinaras merupakan salah satu kelurahan di Kecamatan Tomohon Selatan, Kota Tomohon, Sulawesi Utara. Berdasarkan publikasi BPS Kota Tomohon tahun 2021 dengan data rujukan tahun 2020, Pinaras memiliki luas wilayah 3,98 km², berada pada ketinggian sekitar 661 meter di atas permukaan laut, dan terdiri atas 8 Satuan Lingkungan Setempat.</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[['3,98 km²', 'Luas wilayah', 'BPS Tabel 1.1.1'], ['2.341 jiwa', 'Penduduk', 'BPS Tabel 3.1.2, SP2020'], ['8 SLS', 'Lingkungan setempat', 'BPS Tabel 2.1.1'], ['661 mdpl', 'Ketinggian', 'BPS Tabel 1.1.3']].map(([value, label, source]) => (
              <div key={label} className="border-l-2 border-[var(--accent)] bg-white px-5 py-4">
                <p className="text-2xl font-bold text-[var(--ink)]">{value}</p>
                <p className="mt-1 text-sm font-bold text-[var(--muted)]">{label}</p>
                <p className="mt-2 text-xs text-[var(--muted)]">{source} · referensi 2020</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="bg-white p-6">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Masyarakat dan ekonomi</p>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">Data 2020 mencatat 467 penduduk bekerja sebagai petani, 40 sebagai pedagang, dan 145 sebagai PNS. Pinaras juga memiliki 8 industri mikro makanan, 1 industri mikro kayu, dan 69 jasa pertukangan kayu.</p>
            </div>
            <div className="bg-white p-6">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Layanan dan konektivitas</p>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">Data Podes 2020 mencatat 1 PAUD, 2 TK, 1 SD negeri, 1 SD swasta, 1 SMP swasta, 1 puskesmas, dan 1 posyandu. Wilayah tercatat memiliki sinyal seluler kuat dari 5 operator.</p>
            </div>
          </div>
          <p className="mt-5 text-xs text-[var(--muted)]">Sumber statistik: BPS Kota Tomohon, Kecamatan Tomohon Selatan Dalam Angka 2021, referensi data 2020. Statistik terbaru dan sejarah resmi kelurahan perlu diverifikasi sebelum dipublikasikan.</p>
        </section>
      </section>
    </main>
  );
}

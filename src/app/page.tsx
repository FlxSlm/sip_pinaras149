import Link from "next/link";
import Image from "next/image";

function MountainSilhouette({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 220"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M0 220 L0 150 L180 60 L340 130 L520 30 L700 140 L880 50 L1060 150 L1240 70 L1440 140 L1440 220 Z"
        fill="currentColor"
        opacity="0.55"
      />
      <path
        d="M0 220 L0 180 L220 110 L420 180 L640 90 L860 180 L1080 110 L1280 180 L1440 120 L1440 220 Z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}

function SectionHeading({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--leaf)]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--ink)] sm:text-4xl">{title}</h2>
      {desc ? <p className="mt-4 text-base leading-7 text-[var(--muted)]">{desc}</p> : null}
    </div>
  );
}

const stats = [
  { value: "3,98 km²", label: "Luas wilayah", source: "BPS Tabel 1.1.1 · 2020" },
  { value: "2.341 jiwa", label: "Penduduk", source: "BPS Tabel 3.1.2 · SP2020" },
  { value: "8 SLS", label: "Lingkungan setempat", source: "BPS Tabel 2.1.1 · 2020" },
  { value: "661 mdpl", label: "Ketinggian", source: "BPS Tabel 1.1.3 · 2020" },
];

const potentials = [
  { title: "Pertanian", value: "346 ha", note: "Tegal/kebun/ladang/huma", source: "BPS Tabel 5.1" },
  { title: "Tenaga petani", value: "467 orang", note: "Pekerjaan penduduk", source: "BPS Tabel 3.2.1" },
  { title: "Industri mikro", value: "9 usaha", note: "8 makanan, 1 kayu", source: "BPS Tabel 6.1.1" },
  { title: "Pertukangan kayu", value: "69 jasa", note: "Jasa/pertukangan", source: "BPS Tabel 6.1.2" },
  { title: "Toko & warung", value: "30 unit", note: "Perdagangan", source: "BPS Tabel 7.1.1" },
  { title: "Wisata alam", value: "1 objek", note: "Nama belum diverifikasi", source: "BPS Tabel 8.1.2" },
];

const facilities = [
  { title: "Pendidikan", items: ["1 PAUD", "2 TK", "1 SD negeri", "1 SD swasta", "1 SMP swasta"], source: "BPS Tabel 4.1.1–4.1.4" },
  { title: "Kesehatan", items: ["1 Puskesmas", "1 Posyandu", "3 dokter"], source: "BPS Tabel 4.2.1–4.2.2" },
  { title: "Peribadatan", items: ["5 gereja Protestan", "1 gereja Katolik"], source: "BPS Tabel 4.3.2" },
  { title: "Energi & komunikasi", items: ["726 rumah tangga (PLN)", "5 operator seluler · sinyal kuat"], source: "BPS Tabel 6.2.1, 9.1.2" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--surface)]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--brand-deep)]/95 text-white backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[var(--leaf)] to-[var(--brand)] text-lg font-black text-white">
              P
            </div>
            <div>
              <p className="text-sm font-extrabold leading-tight">SIP Pinaras</p>
              <p className="text-[11px] leading-tight text-white/70">Kelurahan Pinaras · Tomohon Selatan</p>
            </div>
          </div>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-white/85 lg:flex">
            <a href="#profil" className="hover:text-white">Profil</a>
            <a href="#potensi" className="hover:text-white">Potensi</a>
            <a href="#layanan" className="hover:text-white">Layanan</a>
            <Link href="/pengumuman" className="hover:text-white">Pengumuman</Link>
            <Link href="/pengaduan" className="hover:text-white">Forum Pengaduan</Link>
          </nav>
          <Link href="/login" className="rounded-full bg-[var(--leaf)] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-black/10 hover:bg-[var(--leaf-dark)]">
            Masuk
          </Link>
        </div>
      </header>

      <section className="nature-hero relative overflow-hidden text-white">
        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28 lg:py-32">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] backdrop-blur">
              Sistem Informasi Peduli Pinaras
            </p>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] sm:text-6xl">
              Layanan kelurahan yang dekat, transparan, dan mudah diakses warga.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">
              Portal informasi dan pengaduan Kelurahan Pinaras, Kecamatan Tomohon Selatan, Kota Tomohon. Warga dapat masuk untuk menyampaikan pengaduan, dan Admin Kelurahan menindaklanjutinya.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/login" className="rounded-full bg-[var(--leaf)] px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-black/20 hover:bg-[var(--leaf-dark)]">
                Buat pengaduan
              </Link>
              <Link href="/pengaduan" className="rounded-full border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur hover:bg-white/20">
                Lihat forum pengaduan
              </Link>
            </div>
          </div>
        </div>
        <MountainSilhouette className="block h-20 w-full text-[var(--brand-deep)] sm:h-28" />
      </section>

      <section id="profil" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <SectionHeading
          eyebrow="Profil Kelurahan"
          title="Mengenal Kelurahan Pinaras"
          desc="Kelurahan Pinaras adalah salah satu dari 12 kelurahan di Kecamatan Tomohon Selatan, Kota Tomohon, Sulawesi Utara. Berjarak sekitar 8,3 km dari ibu kota kecamatan."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_10px_30px_rgba(18,50,59,0.05)]">
              <p className="text-3xl font-extrabold text-[var(--brand-dark)]">{item.value}</p>
              <p className="mt-2 text-sm font-bold text-[var(--ink)]">{item.label}</p>
              <p className="mt-3 text-xs text-[var(--muted)]">{item.source}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs leading-6 text-[var(--muted)]">
          Sumber: BPS Kota Tomohon, Kecamatan Tomohon Selatan Dalam Angka 2021 (data rujukan utamanya 2020). Statistik terbaru dan data resmi lain menunggu verifikasi kelurahan.
        </p>
      </section>

      <section id="potensi" className="bg-[var(--surface-2)] py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="Potensi Kelurahan"
            title="Sumber daya dan potensi Pinaras"
            desc="Gambaran potensi ekonomi dan sumber daya lokal berdasarkan data BPS tahun 2020."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {potentials.map((item) => (
              <div key={item.title} className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_10px_30px_rgba(18,50,59,0.05)]">
                <p className="text-sm font-bold uppercase tracking-wide text-[var(--leaf)]">{item.title}</p>
                <p className="mt-2 text-3xl font-extrabold text-[var(--ink)]">{item.value}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{item.note}</p>
                <p className="mt-4 text-xs text-[var(--muted)]">{item.source}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="layanan" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <SectionHeading
          eyebrow="Fasilitas & Layanan"
          title="Fasilitas umum di Pinaras"
          desc="Fasilitas pendidikan, kesehatan, peribadatan, dan konektivitas yang tercatat pada data BPS 2020."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {facilities.map((facility) => (
            <div key={facility.title} className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_10px_30px_rgba(18,50,59,0.05)]">
              <p className="text-sm font-extrabold text-[var(--ink)]">{facility.title}</p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
                {facility.items.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--leaf)]" />
                    {line}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-[var(--muted)]">{facility.source}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col justify-between rounded-3xl bg-[var(--brand-deep)] p-8 text-white">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">Pengumuman</p>
              <h3 className="mt-3 text-2xl font-extrabold">Informasi resmi kelurahan</h3>
              <p className="mt-3 text-sm leading-6 text-white/80">Pengumuman dan surat edaran Kelurahan Pinaras dapat dibaca tanpa perlu masuk.</p>
            </div>
            <Link href="/pengumuman" className="mt-6 inline-flex w-fit rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[var(--brand-deep)]">
              Lihat pengumuman
            </Link>
          </div>
          <div className="flex flex-col justify-between rounded-3xl border border-[var(--line)] bg-white p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--leaf)]">Forum pengaduan publik</p>
              <h3 className="mt-3 text-2xl font-extrabold text-[var(--ink)]">Transparansi penanganan pengaduan</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Pengaduan yang telah selesai atau ditolak ditampilkan secara publik tanpa membuka data pribadi pelapor.</p>
            </div>
            <Link href="/pengaduan" className="mt-6 inline-flex w-fit rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-bold text-white">
              Buka forum pengaduan
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <SectionHeading eyebrow="Galeri" title="Wajah Pinaras" />
        <div className="mt-10 overflow-hidden rounded-3xl shadow-[0_20px_50px_rgba(18,50,59,0.18)]">
          <div className="relative aspect-[16/7]">
            <Image src="/images/panorama-pinaras.png" alt="Panorama alam Kelurahan Pinaras" fill sizes="(max-width: 1024px) 100vw, 72vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,63,92,0.55)] to-transparent" />
            <p className="absolute bottom-5 left-6 text-sm font-bold text-white">Panorama alam Pinaras · Tomohon Selatan</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-[var(--muted)]">Foto resmi, kredit, dan lisensi menunggu verifikasi kelurahan sebelum dipublikasikan lebih luas.</p>
      </section>

      <section id="lokasi" className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="grid gap-6 rounded-3xl border border-[var(--line)] bg-white p-8 md:grid-cols-2 md:p-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--leaf)]">Lokasi</p>
            <h3 className="mt-3 text-2xl font-extrabold text-[var(--ink)]">Kecamatan Tomohon Selatan, Kota Tomohon</h3>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Pinaras berjarak sekitar 8,3 km dari ibu kota kecamatan dan dapat diakses melalui jalur darat dengan permukaan aspal sepanjang tahun.
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--surface)] p-6">
            <p className="text-sm font-bold text-[var(--ink)]">Peta & koordinat</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Koordinat kantor dan batas administrasi resmi masih menunggu verifikasi kelurahan sebelum ditampilkan.</p>
          </div>
        </div>
      </section>

      <section id="kontak" className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="rounded-3xl bg-[var(--brand-deep)] p-8 text-center text-white md:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">Hubungi kami</p>
          <h3 className="mt-3 text-3xl font-extrabold">Sampaikan aspirasi Anda</h3>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/80">
            Alamat, telepon, dan WhatsApp resmi kelurahan akan ditampilkan setelah diverifikasi. Sementara itu, warga dapat menyampaikan pengaduan melalui portal ini.
          </p>
          <Link href="/login" className="mt-7 inline-flex rounded-full bg-[var(--leaf)] px-7 py-3.5 text-sm font-bold text-white hover:bg-[var(--leaf-dark)]">
            Masuk & buat pengaduan
          </Link>
        </div>
      </section>

      <footer className="nature-footer relative overflow-hidden text-white">
        <MountainSilhouette className="block h-16 w-full rotate-180 text-[var(--brand-deep)]" />
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <p className="text-lg font-extrabold">SIP Pinaras</p>
              <p className="mt-2 text-sm leading-6 text-white/75">Sistem Informasi Peduli Pinaras — portal informasi dan pengaduan warga Kelurahan Pinaras, Kecamatan Tomohon Selatan, Kota Tomohon.</p>
            </div>
            <div className="text-sm text-white/75">
              <p className="font-bold text-white">Navigasi</p>
              <div className="mt-3 grid gap-2">
                <a href="#profil" className="hover:text-white">Profil kelurahan</a>
                <a href="#potensi" className="hover:text-white">Potensi</a>
                <Link href="/pengumuman" className="hover:text-white">Pengumuman</Link>
                <Link href="/pengaduan" className="hover:text-white">Forum pengaduan</Link>
              </div>
            </div>
            <div className="text-sm text-white/75">
              <p className="font-bold text-white">Sumber data</p>
              <p className="mt-3 leading-6">BPS Kota Tomohon — Kecamatan Tomohon Selatan Dalam Angka 2021 (data rujukan utamanya 2020).</p>
            </div>
          </div>
          <div className="mt-10 border-t border-white/15 pt-6 text-center text-xs text-white/60">
            © {new Date().getFullYear()} Kelurahan Pinaras · Kecamatan Tomohon Selatan · Kota Tomohon
          </div>
        </div>
      </footer>
    </main>
  );
}

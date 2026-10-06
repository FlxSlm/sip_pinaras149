import Link from "next/link";
import Image from "next/image";
import { getLandingContent } from "@/lib/cms";
import { Reveal } from "@/components/reveal";

function MountainSilhouette({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true" className={className}>
            <path d="M0 220 L0 150 L180 60 L340 130 L520 30 L700 140 L880 50 L1060 150 L1240 70 L1440 140 L1440 220 Z" fill="currentColor" opacity="0.55" />
            <path d="M0 220 L0 180 L220 110 L420 180 L640 90 L860 180 L1080 110 L1280 180 L1440 120 L1440 220 Z" fill="currentColor" opacity="0.85" />
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

function str(value: unknown, fallback = ""): string {
    return typeof value === "string" && value.length > 0 ? value : fallback;
}

export default async function Home() {
    const content = await getLandingContent();

    const hero = content.hero as Record<string, unknown>;
    const profil = content.profil as Record<string, unknown>;
    const lokasi = content.lokasi as Record<string, unknown>;
    const kontak = content.kontak as Record<string, unknown>;

    const heroTitle = str(hero.title, "Layanan kelurahan yang dekat, transparan, dan mudah diakses warga.");
    const heroSubtitle = str(hero.subtitle, "Portal informasi dan pengaduan Kelurahan Pinaras.");
    const heroCta = str(hero.ctaText, "Buat pengaduan");
    const heroCtaSecondary = str(hero.ctaSecondaryText, "Lihat forum pengaduan");
    const heroImage = str(hero.image, "/images/panorama-pinaras.png");

    const kontakRows = [
        { label: "Alamat", value: str(kontak.alamat) },
        { label: "Telepon", value: str(kontak.telepon) },
        { label: "WhatsApp", value: str(kontak.whatsapp) },
        { label: "Email", value: str(kontak.email) },
    ].filter((item) => item.value.length > 0);

    return (
        <main className="min-h-screen bg-[var(--surface)]">
            <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--brand-deep)]/95 text-white backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
                    <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[var(--leaf)] to-[var(--brand)] text-lg font-black text-white">P</div>
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

            <section
                className="relative overflow-hidden text-white"
                style={{ backgroundImage: `linear-gradient(160deg, rgba(8,47,66,0.94) 0%, rgba(10,63,92,0.78) 40%, rgba(31,157,107,0.42) 100%), url("${heroImage}")`, backgroundSize: "cover", backgroundPosition: "center" }}
            >
                <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28 lg:py-32">
                    <div className="max-w-3xl animate-rise">
                        <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] backdrop-blur">
                            Sistem Informasi Peduli Pinaras
                        </p>
                        <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] sm:text-6xl">{heroTitle}</h1>
                        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">{heroSubtitle}</p>
                        <div className="mt-9 flex flex-wrap gap-3">
                            <Link href="/login" className="rounded-full bg-[var(--leaf)] px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-black/20 hover:bg-[var(--leaf-dark)]">{heroCta}</Link>
                            <Link href="/pengaduan" className="rounded-full border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur hover:bg-white/20">{heroCtaSecondary}</Link>
                        </div>
                    </div>
                </div>
                <MountainSilhouette className="block h-20 w-full text-[var(--brand-deep)] sm:h-28" />
            </section>

            <section id="profil" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
                <Reveal>
                    <SectionHeading eyebrow="Profil Kelurahan" title="Mengenal Kelurahan Pinaras" desc={str(profil.shortDesc, "Kelurahan Pinaras adalah salah satu dari 12 kelurahan di Kecamatan Tomohon Selatan, Kota Tomohon.")} />
                    <p className="mx-auto mt-6 max-w-3xl text-center text-base leading-7 text-[var(--muted)]">{str(profil.longDesc, "")}</p>
                </Reveal>
                <Reveal className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {content.statistics.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_10px_30px_rgba(18,50,59,0.05)]">
                            <p className="text-3xl font-extrabold text-[var(--brand-dark)]">{item.value}{item.unit ? <span className="ml-1 text-lg">{item.unit}</span> : null}</p>
                            <p className="mt-2 text-sm font-bold text-[var(--ink)]">{item.label}</p>
                            <p className="mt-3 text-xs text-[var(--muted)]">{item.source}{item.sourceYear ? ` · ${item.sourceYear}` : ""}</p>
                        </div>
                    ))}
                </Reveal>
            </section>

            <section id="potensi" className="bg-[var(--surface-2)] py-20">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <Reveal>
                        <SectionHeading eyebrow="Potensi Kelurahan" title="Sumber daya dan potensi Pinaras" desc="Gambaran potensi ekonomi dan sumber daya lokal." />
                    </Reveal>
                    <Reveal className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {content.potentials.map((item) => (
                            <div key={item.id} className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_10px_30px_rgba(18,50,59,0.05)] transition hover:-translate-y-0.5 hover:shadow-md">
                                <p className="text-sm font-bold uppercase tracking-wide text-[var(--leaf)]">{item.title}</p>
                                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.description}</p>
                                {item.sourceNote ? <p className="mt-4 text-xs text-[var(--muted)]">{item.sourceNote}</p> : null}
                            </div>
                        ))}
                    </Reveal>
                </div>
            </section>

            <section id="layanan" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
                <Reveal>
                    <SectionHeading eyebrow="Fasilitas & Layanan" title="Fasilitas umum di Pinaras" />
                </Reveal>
                <Reveal className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {content.facilities.map((facility) => (
                        <div key={facility.id} className="rounded-2xl border border-[var(--line)] bg-white p-6 shadow-[0_10px_30px_rgba(18,50,59,0.05)]">
                            <p className="text-xs font-bold uppercase tracking-wide text-[var(--leaf)]">{facility.category}</p>
                            <p className="mt-2 text-lg font-extrabold text-[var(--ink)]">{facility.name}</p>
                            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{facility.description}</p>
                            {facility.sourceNote ? <p className="mt-4 text-xs text-[var(--muted)]">{facility.sourceNote}</p> : null}
                        </div>
                    ))}
                </Reveal>
            </section>

            <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
                <Reveal className="grid gap-5 md:grid-cols-2">
                    <div className="flex flex-col justify-between rounded-3xl bg-[var(--brand-deep)] p-8 text-white">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">Pengumuman</p>
                            <h3 className="mt-3 text-2xl font-extrabold">Informasi resmi kelurahan</h3>
                            <p className="mt-3 text-sm leading-6 text-white/80">Pengumuman dan surat edaran Kelurahan Pinaras dapat dibaca tanpa perlu masuk.</p>
                        </div>
                        <Link href="/pengumuman" className="mt-6 inline-flex w-fit rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[var(--brand-deep)]">Lihat pengumuman</Link>
                    </div>
                    <div className="flex flex-col justify-between rounded-3xl border border-[var(--line)] bg-white p-8">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--leaf)]">Forum pengaduan publik</p>
                            <h3 className="mt-3 text-2xl font-extrabold text-[var(--ink)]">Transparansi penanganan pengaduan</h3>
                            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Pengaduan yang telah selesai atau ditolak ditampilkan secara publik tanpa membuka data pribadi pelapor.</p>
                        </div>
                        <Link href="/pengaduan" className="mt-6 inline-flex w-fit rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-bold text-white">Buka forum pengaduan</Link>
                    </div>
                </Reveal>
            </section>

            <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
                <Reveal>
                    <SectionHeading eyebrow="Galeri" title="Wajah Pinaras" />
                    <div className="mt-10 overflow-hidden rounded-3xl shadow-[0_20px_50px_rgba(18,50,59,0.18)]">
                        <div className="relative aspect-[16/7]">
                            <Image src={heroImage} alt="Panorama alam Kelurahan Pinaras" fill sizes="(max-width: 1024px) 100vw, 72vw" className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,63,92,0.55)] to-transparent" />
                            <p className="absolute bottom-5 left-6 text-sm font-bold text-white">Panorama alam Pinaras · Tomohon Selatan</p>
                        </div>
                    </div>
                </Reveal>
            </section>

            <section id="lokasi" className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
                <Reveal className="grid gap-6 rounded-3xl border border-[var(--line)] bg-white p-8 md:grid-cols-2 md:p-10">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--leaf)]">Lokasi</p>
                        <h3 className="mt-3 text-2xl font-extrabold text-[var(--ink)]">Kecamatan Tomohon Selatan, Kota Tomohon</h3>
                        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{str(lokasi.deskripsi, "Pinaras dapat diakses melalui jalur darat dengan permukaan aspal.")}</p>
                    </div>
                    <div className="rounded-2xl bg-[var(--surface)] p-6">
                        <p className="text-sm font-bold text-[var(--ink)]">Alamat & koordinat</p>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                            {str(lokasi.alamat, "Alamat kantor")}{str(lokasi.alamat) ? " · " : ""}{str(lokasi.koordinat, "") || "Koordinat menunggu verifikasi kelurahan."}
                        </p>
                    </div>
                </Reveal>
            </section>

            <section id="kontak" className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
                <Reveal className="rounded-3xl bg-[var(--brand-deep)] p-8 text-center text-white md:p-12">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--gold)]">Hubungi kami</p>
                    <h3 className="mt-3 text-3xl font-extrabold">Sampaikan aspirasi Anda</h3>
                    {kontakRows.length > 0 ? (
                        <div className="mx-auto mt-5 flex max-w-xl flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-white/85">
                            {kontakRows.map((row) => (
                                <span key={row.label}><span className="font-bold text-white">{row.label}:</span> {row.value}</span>
                            ))}
                        </div>
                    ) : (
                        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/80">Alamat, telepon, dan WhatsApp resmi kelurahan akan ditampilkan setelah diverifikasi.</p>
                    )}
                    <Link href="/login" className="mt-7 inline-flex rounded-full bg-[var(--leaf)] px-7 py-3.5 text-sm font-bold text-white hover:bg-[var(--leaf-dark)]">Masuk & buat pengaduan</Link>
                </Reveal>
            </section>

            <footer className="nature-footer relative overflow-hidden text-white">
                <MountainSilhouette className="block h-16 w-full rotate-180 text-[var(--brand-deep)]" />
                <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
                    <div className="grid gap-8 md:grid-cols-3">
                        <div>
                            <p className="text-lg font-extrabold">SIP Pinaras</p>
                            <p className="mt-2 text-sm leading-6 text-white/75">Sistem Informasi Peduli Pinaras — portal informasi dan pengaduan warga Kelurahan Pinaras.</p>
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

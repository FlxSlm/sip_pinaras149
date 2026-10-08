import Link from "next/link";
import Image from "next/image";
import { getLandingContent } from "@/lib/cms";
import { Reveal } from "@/components/reveal";

function MountainSilhouette({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true" className={className}>
            <path d="M0 120 L0 80 L180 35 L340 70 L520 15 L700 75 L880 25 L1060 80 L1240 40 L1440 75 L1440 120 Z" fill="currentColor" opacity="0.5" />
            <path d="M0 120 L0 95 L220 60 L420 95 L640 50 L860 95 L1080 60 L1280 95 L1440 65 L1440 120 Z" fill="currentColor" opacity="0.8" />
        </svg>
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

    /* Group facilities by category */
    const facilityGroups: Record<string, typeof content.facilities> = {};
    for (const f of content.facilities) {
        const cat = f.category || "Lainnya";
        if (!facilityGroups[cat]) facilityGroups[cat] = [];
        facilityGroups[cat].push(f);
    }

    /* Split potentials: first = featured, rest = secondary */
    const featuredPotential = content.potentials[0] ?? null;
    const secondaryPotentials = content.potentials.slice(1);

    return (
        <main className="min-h-screen bg-[var(--surface)] pt-[64px]">
            {/* ═══ NAVBAR ═══ */}
            <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[var(--brand-deep)]/95 text-white backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
                    <div className="flex items-center gap-2.5">
                        <Image src="/images/logo tomohon.png" alt="Logo Tomohon" width={36} height={36} className="logo-pentagon size-9 object-contain" />
                        <div>
                            <p className="text-sm font-bold leading-tight">SIPP</p>
                            <p className="text-[10px] leading-tight text-white/60">Kelurahan Pinaras · Tomohon Selatan</p>
                        </div>
                    </div>
                    <nav className="hidden items-center gap-6 text-[13px] font-medium text-white/80 lg:flex">
                        <a href="#profil" className="hover:text-white">Profil</a>
                        <a href="#potensi" className="hover:text-white">Potensi</a>
                        <a href="#layanan" className="hover:text-white">Layanan</a>
                        <Link href="/pengumuman" className="hover:text-white">Pengumuman</Link>
                        <Link href="/pengaduan" className="hover:text-white">Forum Pengaduan</Link>
                    </nav>
                    <Link href="/login" className="rounded-full bg-[var(--leaf)] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[var(--leaf-dark)]">
                        Masuk
                    </Link>
                </div>
            </header>

            {/* ═══ HERO ═══ */}
            <section
                className="relative overflow-hidden text-white"
                style={{ backgroundImage: `linear-gradient(170deg, rgba(8,42,60,0.92) 0%, rgba(12,58,82,0.82) 45%, rgba(42,143,98,0.35) 100%), url("${heroImage}")`, backgroundSize: "cover", backgroundPosition: "center 40%" }}
            >
                <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24 lg:py-28">
                    <div className="max-w-2xl animate-rise">
                        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                            Sistem Informasi Peduli Pinaras
                        </p>
                        <h1 className="mt-5 text-3xl font-bold leading-[1.12] sm:text-5xl lg:text-[3.2rem]">{heroTitle}</h1>
                        <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/80">{heroSubtitle}</p>
                        <div className="mt-7 flex flex-wrap gap-3">
                            <Link href="/login" className="rounded-full bg-[var(--leaf)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]">{heroCta}</Link>
                            <Link href="/pengaduan" className="rounded-full border border-white/30 bg-white/8 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15">{heroCtaSecondary}</Link>
                        </div>
                    </div>
                </div>
                <MountainSilhouette className="block h-14 w-full text-[var(--surface)] sm:h-20" />
            </section>

            {/* ═══ STATISTICS STRIP ═══ */}
            <section className="relative -mt-1 bg-[var(--surface)]">
                <Reveal>
                    <div className="mx-auto max-w-4xl px-5 sm:px-8">
                        <div className="flex flex-wrap items-center justify-center gap-x-0 divide-x divide-[var(--line)] rounded-xl border border-[var(--line)] bg-white py-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                            {content.statistics.map((item) => (
                                <div key={item.id} className="flex-1 min-w-[120px] px-5 py-1 text-center">
                                    <p className="text-xl font-bold text-[var(--brand-dark)] sm:text-2xl">{item.value}<span className="ml-1 text-xs font-medium text-[var(--muted)]">{item.unit}</span></p>
                                    <p className="mt-0.5 text-[11px] font-medium text-[var(--muted)]">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* ═══ PROFIL — image + text two-column ═══ */}
            <section id="profil" className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
                <Reveal className="grid items-center gap-8 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                        <div className="relative aspect-[4/3]">
                            <Image src={heroImage} alt="Panorama alam Kelurahan Pinaras" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                        </div>
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--leaf)]">Profil Kelurahan</p>
                        <h2 className="mt-2 text-2xl font-bold text-[var(--ink)] sm:text-3xl">Mengenal Kelurahan Pinaras</h2>
                        <p className="mt-3 text-[15px] leading-7 text-[var(--muted)]">{str(profil.shortDesc, "Kelurahan Pinaras adalah salah satu dari 12 kelurahan di Kecamatan Tomohon Selatan, Kota Tomohon.")}</p>
                        {str(profil.longDesc) && <p className="mt-3 text-[15px] leading-7 text-[var(--muted)]">{str(profil.longDesc)}</p>}
                        <div className="mt-5 flex flex-wrap gap-3 text-sm">
                            <span className="rounded-full bg-[var(--soft-accent)] px-3 py-1 font-medium text-[var(--leaf-dark)]">3,98 km²</span>
                            <span className="rounded-full bg-[var(--soft-accent)] px-3 py-1 font-medium text-[var(--leaf-dark)]">2.341 jiwa</span>
                            <span className="rounded-full bg-[var(--soft-accent)] px-3 py-1 font-medium text-[var(--leaf-dark)]">661 mdpl</span>
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* ═══ POTENSI — featured + secondary ═══ */}
            <section id="potensi" className="bg-[var(--surface-2)] py-14">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <Reveal>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--leaf)]">Potensi Kelurahan</p>
                        <h2 className="mt-2 text-2xl font-bold text-[var(--ink)] sm:text-3xl">Sumber daya dan potensi Pinaras</h2>
                    </Reveal>

                    {featuredPotential && (
                        <Reveal className="mt-8 grid items-center gap-6 rounded-xl border border-[var(--line)] bg-white p-6 lg:grid-cols-[1fr_1.2fr]">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--brand)]">Unggulan</p>
                                <h3 className="mt-1 text-xl font-bold text-[var(--ink)]">{featuredPotential.title}</h3>
                                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{featuredPotential.description}</p>
                                {featuredPotential.sourceNote && <p className="mt-3 text-[11px] text-[var(--muted)]">{featuredPotential.sourceNote}</p>}
                            </div>
                            <div className="overflow-hidden rounded-lg">
                                <div className="relative aspect-[16/9]">
                                    <Image src={heroImage} alt="Potensi pertanian Pinaras" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                                </div>
                            </div>
                        </Reveal>
                    )}

                    <Reveal className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {secondaryPotentials.map((item) => (
                            <div key={item.id} className="rounded-xl border border-[var(--line)] bg-white p-5">
                                <p className="text-sm font-semibold text-[var(--ink)]">{item.title}</p>
                                <p className="mt-1.5 text-[13px] leading-6 text-[var(--muted)]">{item.description}</p>
                                {item.sourceNote && <p className="mt-2 text-[11px] text-[var(--muted)]">{item.sourceNote}</p>}
                            </div>
                        ))}
                    </Reveal>
                </div>
            </section>

            {/* ═══ FASILITAS — grouped ═══ */}
            <section id="layanan" className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
                <Reveal>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--leaf)]">Fasilitas & Layanan</p>
                    <h2 className="mt-2 text-2xl font-bold text-[var(--ink)] sm:text-3xl">Fasilitas umum di Pinaras</h2>
                </Reveal>
                <Reveal className="mt-8 grid gap-3 sm:grid-cols-2">
                    {content.facilities.map((facility) => (
                        <div key={facility.id} className="flex gap-4 rounded-xl border border-[var(--line)] bg-white p-5">
                            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--soft-accent)] text-[var(--leaf)]">
                                <svg viewBox="0 0 24 24" className="size-5" fill="currentColor"><path d="M12 2L2 7v10l10 5 10-5V7L12 2Zm0 2.18 6.8 3.4L12 11l-6.8-3.42L12 4.18Z" /></svg>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--leaf)]">{facility.category}</p>
                                <p className="mt-0.5 text-sm font-semibold text-[var(--ink)]">{facility.name}</p>
                                <p className="mt-1 text-[13px] leading-6 text-[var(--muted)]">{facility.description}</p>
                                {facility.sourceNote && <p className="mt-1.5 text-[11px] text-[var(--muted)]">{facility.sourceNote}</p>}
                            </div>
                        </div>
                    ))}
                </Reveal>
            </section>

            {/* ═══ PENGUMUMAN + FORUM PENGADUAN ═══ */}
            <section className="bg-[var(--surface-2)] py-14">
                <div className="mx-auto max-w-6xl px-5 sm:px-8">
                    <Reveal className="grid gap-4 md:grid-cols-2">
                        <div className="flex flex-col justify-between rounded-xl bg-[var(--brand-deep)] p-7 text-white">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">Pengumuman</p>
                                <h3 className="mt-2 text-xl font-bold">Informasi resmi kelurahan</h3>
                                <p className="mt-2 text-[13px] leading-6 text-white/75">Pengumuman dan surat edaran Kelurahan Pinaras dapat dibaca tanpa perlu masuk.</p>
                            </div>
                            <Link href="/pengumuman" className="mt-5 inline-flex w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-deep)] hover:bg-white/90">Lihat pengumuman</Link>
                        </div>
                        <div className="flex flex-col justify-between rounded-xl border border-[var(--line)] bg-white p-7">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--leaf)]">Forum pengaduan publik</p>
                                <h3 className="mt-2 text-xl font-bold text-[var(--ink)]">Transparansi penanganan pengaduan</h3>
                                <p className="mt-2 text-[13px] leading-6 text-[var(--muted)]">Pengaduan yang telah selesai atau ditolak ditampilkan secara publik tanpa membuka data pribadi pelapor.</p>
                            </div>
                            <Link href="/pengaduan" className="mt-5 inline-flex w-fit rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-deep)]">Buka forum pengaduan</Link>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ═══ GALERI ═══ */}
            <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
                <Reveal>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--leaf)]">Galeri</p>
                    <h2 className="mt-2 text-2xl font-bold text-[var(--ink)]">Wajah Pinaras</h2>
                    <div className="mt-6 overflow-hidden rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.1)]">
                        <div className="relative aspect-[16/7]">
                            <Image src={heroImage} alt="Panorama alam Kelurahan Pinaras" fill sizes="(max-width: 1024px) 100vw, 72vw" className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,58,82,0.5)] to-transparent" />
                            <p className="absolute bottom-4 left-5 text-[13px] font-medium text-white">Panorama alam Pinaras · Tomohon Selatan</p>
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* ═══ LOKASI ═══ */}
            <section id="lokasi" className="mx-auto max-w-6xl px-5 pb-14 sm:px-8">
                <Reveal className="grid gap-5 rounded-xl border border-[var(--line)] bg-white p-6 md:grid-cols-2 md:p-8">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--leaf)]">Lokasi</p>
                        <h3 className="mt-2 text-xl font-bold text-[var(--ink)]">Kecamatan Tomohon Selatan, Kota Tomohon</h3>
                        <p className="mt-3 text-[13px] leading-7 text-[var(--muted)]">{str(lokasi.deskripsi, "Pinaras dapat diakses melalui jalur darat dengan permukaan aspal.")}</p>
                    </div>
                    <div className="rounded-lg bg-[var(--surface)] p-5">
                        <p className="text-sm font-semibold text-[var(--ink)]">Alamat & koordinat</p>
                        <p className="mt-1.5 text-[13px] leading-6 text-[var(--muted)]">
                            {str(lokasi.alamat, "Alamat kantor")}{str(lokasi.alamat) ? " · " : ""}{str(lokasi.koordinat, "") || "Koordinat menunggu verifikasi kelurahan."}
                        </p>
                    </div>
                </Reveal>
            </section>

            {/* ═══ KONTAK / CTA ═══ */}
            <section id="kontak" className="mx-auto max-w-6xl px-5 pb-14 sm:px-8">
                <Reveal className="rounded-xl bg-[var(--brand-deep)] p-7 text-center text-white md:p-10">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">Hubungi kami</p>
                    <h3 className="mt-2 text-2xl font-bold">Sampaikan aspirasi Anda</h3>
                    {kontakRows.length > 0 ? (
                        <div className="mx-auto mt-4 flex max-w-xl flex-wrap justify-center gap-x-6 gap-y-1.5 text-[13px] text-white/80">
                            {kontakRows.map((row) => (
                                <span key={row.label}><span className="font-semibold text-white">{row.label}:</span> {row.value}</span>
                            ))}
                        </div>
                    ) : (
                        <p className="mx-auto mt-3 max-w-xl text-[13px] leading-6 text-white/75">Alamat, telepon, dan WhatsApp resmi kelurahan akan ditampilkan setelah diverifikasi.</p>
                    )}
                    <Link href="/login" className="mt-6 inline-flex rounded-full bg-[var(--leaf)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--leaf-dark)]">Masuk & buat pengaduan</Link>
                </Reveal>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer className="nature-footer relative overflow-hidden text-white">
                <MountainSilhouette className="block h-12 w-full rotate-180 text-[var(--brand-deep)]" />
                <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
                    <div className="grid gap-8 md:grid-cols-3">
                        <div>
                            <Image src="/images/logo tomohon.png" alt="Logo Tomohon" width={40} height={40} className="logo-pentagon mb-3 size-10 object-contain" />
                            <p className="text-base font-bold">SIP Pinaras</p>
                            <p className="mt-1.5 text-[13px] leading-6 text-white/70">Sistem Informasi Peduli Pinaras — portal informasi dan pengaduan warga Kelurahan Pinaras.</p>
                        </div>
                        <div className="text-[13px] text-white/70">
                            <p className="font-semibold text-white">Navigasi</p>
                            <div className="mt-2 grid gap-1.5">
                                <a href="#profil" className="hover:text-white">Profil kelurahan</a>
                                <a href="#potensi" className="hover:text-white">Potensi</a>
                                <Link href="/pengumuman" className="hover:text-white">Pengumuman</Link>
                                <Link href="/pengaduan" className="hover:text-white">Forum pengaduan</Link>
                            </div>
                        </div>
                        <div className="text-[13px] text-white/70">
                            <p className="font-semibold text-white">Sumber data</p>
                            <p className="mt-2 leading-6">BPS Kota Tomohon — Kecamatan Tomohon Selatan Dalam Angka 2021 (data rujukan utamanya 2020).</p>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-white/10 pt-5 text-center text-[11px] text-white/50">
                        © {new Date().getFullYear()} Kelurahan Pinaras · Kecamatan Tomohon Selatan · Kota Tomohon
                    </div>
                </div>
            </footer>
        </main>
    );
}

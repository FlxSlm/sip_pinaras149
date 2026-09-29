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
          <span className="rounded-full bg-[var(--soft-accent)] px-4 py-2 text-sm font-medium text-[var(--accent)]">
            Portal layanan warga
          </span>
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
            Fondasi aplikasi sedang disiapkan. Informasi profil, layanan, dan pengaduan akan hadir bertahap sesuai alur pelayanan Kelurahan Pinaras.
          </p>
        </div>
        <div className="mt-16 grid gap-5 border-t border-[var(--line)] pt-6 sm:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">Akses mudah</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Dirancang untuk penggunaan mobile dan desktop.</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">Alur jelas</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Pelayanan mengikuti proses warga hingga kelurahan.</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">Bertahap</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Fitur akan ditambahkan dan diverifikasi per modul.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export function PageLoading() {
    return <div className="mx-auto max-w-7xl animate-pulse space-y-6" role="status" aria-label="Memuat halaman"><div className="h-28 rounded-2xl bg-[var(--surface-2)]" /><div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((id) => <div key={id} className="h-24 rounded-xl bg-[var(--surface-2)]" />)}</div><div className="h-64 rounded-2xl bg-[var(--surface-2)]" /><span className="sr-only">Memuat halaman…</span></div>;
}

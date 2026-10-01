import { prisma } from "@/lib/prisma";

export default async function LeaderboardPage() {
    const users = await prisma.user.findMany({ where: { role: { in: ["kepala_lingkungan", "lurah"] } }, select: { id: true, name: true, role: true, lingkungan: { select: { name: true, code: true } } }, orderBy: { name: "asc" } });
    const rows = await Promise.all(users.map(async (user) => {
        const environment = user.lingkungan ? await prisma.lingkungan.findUnique({ where: { code: user.lingkungan.code }, select: { id: true } }) : null;
        const scope = user.role === "kepala_lingkungan" && environment ? { lingkunganId: environment.id } : {};
        const [total, selesai, ditolak, review] = await Promise.all([
            prisma.complaint.count({ where: scope }),
            prisma.complaint.count({ where: { ...scope, handlingStatus: "SELESAI" } }),
            prisma.complaint.count({ where: { ...scope, handlingStatus: "DI_LUAR_KEWENANGAN" } }),
            prisma.complaint.aggregate({ where: { ...scope, rating: { not: null } }, _avg: { rating: true }, _count: { rating: true } }),
        ]);
        return { ...user, total, selesai, ditolak, review: review._count.rating, average: review._avg.rating ?? 0 };
    }));
    return <main className="min-h-screen px-6 py-12"><div className="mx-auto max-w-5xl"><p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Transparansi layanan</p><h1 className="mt-3 text-4xl font-bold">Leaderboard pelayanan</h1><p className="mt-3 max-w-2xl text-[var(--muted)]">Ringkasan kinerja pengaduan berdasarkan lingkungan dan peran pelayanan.</p><div className="mt-8 grid gap-4 md:grid-cols-2">{rows.map((row) => <article key={row.id} className="rounded-xl border border-[var(--line)] bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h2 className="text-xl font-semibold">{row.role === "lurah" ? "Lurah" : row.lingkungan?.name ?? "Kepala Lingkungan"}</h2><p className="text-sm text-[var(--muted)]">{row.role === "lurah" ? "Seluruh wilayah" : row.lingkungan?.code}</p></div><strong className="text-2xl text-[var(--gold)]">{row.average.toFixed(1)} <span className="text-sm">★</span></strong></div><div className="mt-5 grid grid-cols-2 gap-3 text-sm"><p>Total diterima <strong className="block text-xl">{row.total}</strong></p><p>Selesai <strong className="block text-xl text-emerald-700">{row.selesai}</strong></p><p>Ditolak <strong className="block text-xl text-red-700">{row.ditolak}</strong></p><p>Total review <strong className="block text-xl">{row.review}</strong></p></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--surface)]"><div className="h-full bg-[var(--accent)]" style={{ width: `${row.total ? Math.min(100, row.selesai / row.total * 100) : 0}%` }} /></div></article>)}</div></div></main>;
}

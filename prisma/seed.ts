import { randomBytes, scryptSync } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient, UserRole } from "../src/generated/prisma/client";

const connectionString =
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/sip_pinaras?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function hashPassword(password: string): string {
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(password, salt, 64).toString("hex");
    return `scrypt:${salt}:${hash}`;
}

const statistics = [
    { label: "Luas wilayah", value: "3,98", unit: "km²", source: "BPS Tabel 1.1.1", sourceYear: "2020" },
    { label: "Penduduk", value: "2.341", unit: "jiwa", source: "BPS Tabel 3.1.2", sourceYear: "2020" },
    { label: "Lingkungan setempat", value: "8", unit: "SLS", source: "BPS Tabel 2.1.1", sourceYear: "2020" },
    { label: "Ketinggian", value: "661", unit: "mdpl", source: "BPS Tabel 1.1.3", sourceYear: "2020" },
];

const potentials = [
    { title: "Pertanian", description: "Tegal/kebun/ladang/huma seluas 346 ha.", sourceNote: "BPS Tabel 5.1" },
    { title: "Tenaga petani", description: "467 penduduk bekerja sebagai petani.", sourceNote: "BPS Tabel 3.2.1" },
    { title: "Industri mikro", description: "8 industri makanan dan 1 industri kayu.", sourceNote: "BPS Tabel 6.1.1" },
    { title: "Pertukangan kayu", description: "69 jasa pertukangan kayu.", sourceNote: "BPS Tabel 6.1.2" },
    { title: "Toko & warung", description: "30 toko/warung kelontong.", sourceNote: "BPS Tabel 7.1.1" },
    { title: "Wisata alam", description: "1 objek wisata alam (nama belum diverifikasi).", sourceNote: "BPS Tabel 8.1.2" },
];

const facilities = [
    { name: "Pendidikan", category: "Pendidikan", description: "1 PAUD, 2 TK, 1 SD negeri, 1 SD swasta, 1 SMP swasta.", sourceNote: "BPS Tabel 4.1.1–4.1.4" },
    { name: "Kesehatan", category: "Kesehatan", description: "1 Puskesmas, 1 Posyandu, 3 dokter.", sourceNote: "BPS Tabel 4.2.1–4.2.2" },
    { name: "Peribadatan", category: "Peribadatan", description: "5 gereja Protestan dan 1 gereja Katolik.", sourceNote: "BPS Tabel 4.3.2" },
    { name: "Energi & komunikasi", category: "Infrastruktur", description: "726 rumah tangga (PLN); 5 operator seluler dengan sinyal kuat.", sourceNote: "BPS Tabel 6.2.1, 9.1.2" },
];

const siteContent = {
    hero: {
        title: "Layanan kelurahan yang dekat, transparan, dan mudah diakses warga.",
        subtitle: "Portal informasi dan pengaduan Kelurahan Pinaras, Kecamatan Tomohon Selatan, Kota Tomohon.",
        ctaText: "Buat pengaduan",
        ctaSecondaryText: "Lihat forum pengaduan",
        image: "/images/panorama-pinaras.png",
    },
    profil: {
        shortDesc: "Kelurahan Pinaras adalah salah satu dari 12 kelurahan di Kecamatan Tomohon Selatan, Kota Tomohon, Sulawesi Utara.",
        longDesc: "Kelurahan Pinaras memiliki luas wilayah 3,98 km², berada pada ketinggian sekitar 661 mdpl, dan terdiri atas 8 Satuan Lingkungan Setempat.",
        sejarah: null,
        visi: null,
        misi: null,
    },
    lokasi: {
        alamat: null,
        koordinat: null,
        deskripsi: "Pinaras berjarak sekitar 8,3 km dari ibu kota kecamatan dan dapat diakses melalui jalur darat dengan permukaan aspal sepanjang tahun.",
    },
    kontak: {
        alamat: null,
        telepon: null,
        whatsapp: null,
        email: null,
    },
};

async function main() {
    const admin = await prisma.user.upsert({
        where: { username: "admin.pinaras" },
        update: {
            name: "Admin Kelurahan Pinaras",
            role: UserRole.ADMIN_KELURAHAN,
            passwordHash: hashPassword(process.env.ADMIN_SEED_PASSWORD ?? "admin123"),
        },
        create: {
            username: "admin.pinaras",
            name: "Admin Kelurahan Pinaras",
            role: UserRole.ADMIN_KELURAHAN,
            passwordHash: hashPassword(process.env.ADMIN_SEED_PASSWORD ?? "admin"),
        },
    });

    await prisma.user.upsert({
        where: { email: "warga.contoh@example.com" },
        update: { name: "Warga Contoh", role: UserRole.WARGA },
        create: { name: "Warga Contoh", email: "warga.contoh@example.com", role: UserRole.WARGA },
    });

    for (const [index, statistic] of statistics.entries()) {
        await prisma.statistic.upsert({
            where: { id: `stat-${index}` },
            update: statistic,
            create: { id: `stat-${index}`, ...statistic, sortOrder: index },
        });
    }

    for (const [index, potential] of potentials.entries()) {
        await prisma.potential.upsert({
            where: { id: `potential-${index}` },
            update: potential,
            create: { id: `potential-${index}`, ...potential, sortOrder: index },
        });
    }

    for (const [index, facility] of facilities.entries()) {
        await prisma.facility.upsert({
            where: { id: `facility-${index}` },
            update: facility,
            create: { id: `facility-${index}`, ...facility },
        });
    }

    for (const [key, value] of Object.entries(siteContent)) {
        await prisma.siteContent.upsert({
            where: { key },
            update: { value: value as never },
            create: { key, value: value as never },
        });
    }

    console.log(`Seeded 1 admin (${admin.id}), 1 warga, ${statistics.length} statistik, ${potentials.length} potensi, ${facilities.length} fasilitas, dan ${Object.keys(siteContent).length} konten landing.`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });

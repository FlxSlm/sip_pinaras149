import { prisma } from "@/lib/prisma";

export type LandingStatistic = {
    id: string;
    label: string;
    value: string;
    unit: string | null;
    source: string;
    sourceYear: string | null;
    sourcePage: string | null;
    sortOrder: number;
    published: boolean;
};

export type LandingPotential = {
    id: string;
    title: string;
    description: string;
    imageRef: string | null;
    sortOrder: number;
    published: boolean;
    sourceNote: string | null;
};

export type LandingFacility = {
    id: string;
    name: string;
    category: string;
    description: string | null;
    published: boolean;
    sourceNote: string | null;
};

export type LandingGallery = {
    id: string;
    storageKey: string;
    caption: string | null;
    credit: string | null;
    category: string | null;
    sortOrder: number;
    published: boolean;
};

const defaultStatistics: LandingStatistic[] = [
    { id: "stat-0", label: "Luas wilayah", value: "3,98", unit: "km²", source: "BPS Tabel 1.1.1", sourceYear: "2020", sourcePage: null, sortOrder: 0, published: true },
    { id: "stat-1", label: "Penduduk", value: "2.341", unit: "jiwa", source: "BPS Tabel 3.1.2", sourceYear: "2020", sourcePage: null, sortOrder: 1, published: true },
    { id: "stat-2", label: "Lingkungan setempat", value: "8", unit: "SLS", source: "BPS Tabel 2.1.1", sourceYear: "2020", sourcePage: null, sortOrder: 2, published: true },
    { id: "stat-3", label: "Ketinggian", value: "661", unit: "mdpl", source: "BPS Tabel 1.1.3", sourceYear: "2020", sourcePage: null, sortOrder: 3, published: true },
];

const defaultPotentials: LandingPotential[] = [
    { id: "potential-0", title: "Pertanian", description: "Tegal/kebun/ladang/huma seluas 346 ha.", imageRef: null, sortOrder: 0, published: true, sourceNote: "BPS Tabel 5.1" },
    { id: "potential-1", title: "Tenaga petani", description: "467 penduduk bekerja sebagai petani.", imageRef: null, sortOrder: 1, published: true, sourceNote: "BPS Tabel 3.2.1" },
    { id: "potential-2", title: "Industri mikro", description: "8 industri makanan dan 1 industri kayu.", imageRef: null, sortOrder: 2, published: true, sourceNote: "BPS Tabel 6.1.1" },
    { id: "potential-3", title: "Pertukangan kayu", description: "69 jasa pertukangan kayu.", imageRef: null, sortOrder: 3, published: true, sourceNote: "BPS Tabel 6.1.2" },
    { id: "potential-4", title: "Toko & warung", description: "30 toko/warung kelontong.", imageRef: null, sortOrder: 4, published: true, sourceNote: "BPS Tabel 7.1.1" },
    { id: "potential-5", title: "Wisata alam", description: "1 objek wisata alam (nama belum diverifikasi).", imageRef: null, sortOrder: 5, published: true, sourceNote: "BPS Tabel 8.1.2" },
];

const defaultFacilities: LandingFacility[] = [
    { id: "facility-0", name: "Pendidikan", category: "Pendidikan", description: "1 PAUD, 2 TK, 1 SD negeri, 1 SD swasta, 1 SMP swasta.", published: true, sourceNote: "BPS Tabel 4.1.1–4.1.4" },
    { id: "facility-1", name: "Kesehatan", category: "Kesehatan", description: "1 Puskesmas, 1 Posyandu, 3 dokter.", published: true, sourceNote: "BPS Tabel 4.2.1–4.2.2" },
    { id: "facility-2", name: "Peribadatan", category: "Peribadatan", description: "5 gereja Protestan dan 1 gereja Katolik.", published: true, sourceNote: "BPS Tabel 4.3.2" },
    { id: "facility-3", name: "Energi & komunikasi", category: "Infrastruktur", description: "726 rumah tangga (PLN); 5 operator seluler dengan sinyal kuat.", published: true, sourceNote: "BPS Tabel 6.2.1, 9.1.2" },
];

const defaultSiteContent: Record<string, Record<string, unknown>> = {
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

export async function getLandingContent() {
    const [siteContentRows, statistics, potentials, facilities, gallery] = await Promise.all([
        prisma.siteContent.findMany(),
        prisma.statistic.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }),
        prisma.potential.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }),
        prisma.facility.findMany({ where: { published: true }, orderBy: { name: "asc" } }),
        prisma.galleryMedia.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }),
    ]);

    const siteContent = Object.fromEntries(siteContentRows.map((row) => [row.key, row.value as Record<string, unknown>]));

    const hero = { ...defaultSiteContent.hero, ...(siteContent.hero ?? {}) };
    const profil = { ...defaultSiteContent.profil, ...(siteContent.profil ?? {}) };
    const lokasi = { ...defaultSiteContent.lokasi, ...(siteContent.lokasi ?? {}) };
    const kontak = { ...defaultSiteContent.kontak, ...(siteContent.kontak ?? {}) };

    return {
        hero,
        profil,
        lokasi,
        kontak,
        statistics: statistics.length > 0 ? (statistics as unknown as LandingStatistic[]) : defaultStatistics,
        potentials: potentials.length > 0 ? (potentials as unknown as LandingPotential[]) : defaultPotentials,
        facilities: facilities.length > 0 ? (facilities as unknown as LandingFacility[]) : defaultFacilities,
        gallery: gallery as unknown as LandingGallery[],
    };
}

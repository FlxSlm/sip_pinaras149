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
        statistics: statistics as unknown as LandingStatistic[],
        potentials: potentials as unknown as LandingPotential[],
        facilities: facilities as unknown as LandingFacility[],
        gallery: gallery as unknown as LandingGallery[],
    };
}

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const singleSections = new Set(["hero", "profil", "lokasi", "kontak"]);

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user.id || session.user.role !== "ADMIN_KELURAHAN") {
        return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
    }
    const [siteContent, statistics, potentials, facilities, gallery] = await Promise.all([
        prisma.siteContent.findMany(),
        prisma.statistic.findMany({ orderBy: { sortOrder: "asc" } }),
        prisma.potential.findMany({ orderBy: { sortOrder: "asc" } }),
        prisma.facility.findMany({ orderBy: { name: "asc" } }),
        prisma.galleryMedia.findMany({ orderBy: { sortOrder: "asc" } }),
    ]);
    return NextResponse.json({ siteContent, statistics, potentials, facilities, gallery });
}

export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user.id || session.user.role !== "ADMIN_KELURAHAN") {
        return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
    }

    let body: { section?: string; value?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: "Format permintaan tidak valid." }, { status: 400 });
    }

    const section = body.section;
    if (section && singleSections.has(section)) {
        await prisma.siteContent.upsert({
            where: { key: section },
            update: { value: body.value as never, updatedById: session.user.id },
            create: { key: section, value: body.value as never, updatedById: session.user.id },
        });
        return NextResponse.json({ message: "Konten tersimpan." });
    }

    if (section === "statistics") {
        await replaceStatistics(body.value);
        return NextResponse.json({ message: "Statistik tersimpan." });
    }
    if (section === "potentials") {
        await replacePotentials(body.value);
        return NextResponse.json({ message: "Potensi tersimpan." });
    }
    if (section === "facilities") {
        await replaceFacilities(body.value);
        return NextResponse.json({ message: "Fasilitas tersimpan." });
    }

    return NextResponse.json({ message: "Section tidak valid." }, { status: 400 });
}

type StatisticInput = { label: string; value: string; unit?: string | null; source: string; sourceYear?: string | null; sourcePage?: string | null; sortOrder?: number; published?: boolean };
type PotentialInput = { title: string; description: string; imageRef?: string | null; sortOrder?: number; published?: boolean; sourceNote?: string | null };
type FacilityInput = { name: string; category: string; description?: string | null; published?: boolean; sourceNote?: string | null };

async function replaceStatistics(value: unknown) {
    const items = Array.isArray(value) ? (value as StatisticInput[]) : [];
    await prisma.$transaction([
        prisma.statistic.deleteMany(),
        prisma.statistic.createMany({ data: items.map((item, index) => ({ ...item, sortOrder: item.sortOrder ?? index, published: item.published ?? true, source: item.source || "—" })) }),
    ]);
}

async function replacePotentials(value: unknown) {
    const items = Array.isArray(value) ? (value as PotentialInput[]) : [];
    await prisma.$transaction([
        prisma.potential.deleteMany(),
        prisma.potential.createMany({ data: items.map((item, index) => ({ ...item, sortOrder: item.sortOrder ?? index, published: item.published ?? true })) }),
    ]);
}

async function replaceFacilities(value: unknown) {
    const items = Array.isArray(value) ? (value as FacilityInput[]) : [];
    await prisma.$transaction([
        prisma.facility.deleteMany(),
        prisma.facility.createMany({ data: items.map((item) => ({ ...item, category: item.category || "Umum", published: item.published ?? true })) }),
    ]);
}

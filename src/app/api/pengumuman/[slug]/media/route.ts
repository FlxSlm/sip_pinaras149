import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serveAnnouncementMedia } from "@/lib/announcement-media";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const item = await prisma.announcement.findFirst({ where: { slug, status: "PUBLISHED" }, select: { mediaRef: true } });
    if (!item) return new NextResponse("Tidak ditemukan.", { status: 404 });
    return serveAnnouncementMedia(item.mediaRef, request);
}

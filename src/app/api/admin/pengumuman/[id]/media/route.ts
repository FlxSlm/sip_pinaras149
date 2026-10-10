import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serveAnnouncementMedia } from "@/lib/announcement-media";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user.id) return new NextResponse("Tidak terautentikasi.", { status: 401 });
    if (session.user.role !== "ADMIN_KELURAHAN") return new NextResponse("Akses ditolak.", { status: 403 });
    const { id } = await params;
    const item = await prisma.announcement.findUnique({ where: { id }, select: { mediaRef: true } });
    if (!item) return new NextResponse("Tidak ditemukan.", { status: 404 });
    return serveAnnouncementMedia(item.mediaRef, request);
}

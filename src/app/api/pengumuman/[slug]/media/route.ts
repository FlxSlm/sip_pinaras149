import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const mimeByExtension: Record<string, string> = {
    pdf: "application/pdf",
    mp4: "video/mp4",
    webm: "video/webm",
};

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const announcement = await prisma.announcement.findFirst({
        where: { slug, status: "PUBLISHED" },
        select: { mediaRef: true },
    });
    if (!announcement?.mediaRef) return new NextResponse("Tidak ditemukan.", { status: 404 });

    const safeName = path.basename(announcement.mediaRef);
    const extension = safeName.split(".").pop()?.toLowerCase() ?? "";
    const contentType = mimeByExtension[extension];
    if (!contentType) return new NextResponse("Tidak ditemukan.", { status: 404 });

    try {
        const bytes = await readFile(path.join(process.cwd(), "storage", "announcements", safeName));
        return new NextResponse(bytes, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": extension === "pdf" ? `inline; filename="${safeName}"` : `inline`,
                "Cache-Control": "public, max-age=3600",
            },
        });
    } catch {
        return new NextResponse("Tidak ditemukan.", { status: 404 });
    }
}

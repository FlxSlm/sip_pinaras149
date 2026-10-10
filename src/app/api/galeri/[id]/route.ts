import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const item = await prisma.galleryMedia.findFirst({ where: { id, published: true }, select: { storageKey: true, mimeType: true } });
    if (!item || !["image/jpeg", "image/png", "image/webp"].includes(item.mimeType)) return new NextResponse("Tidak ditemukan.", { status: 404 });
    const key = item.storageKey.replaceAll("\\", "/");
    const root = key.startsWith("/images/") ? path.join(process.cwd(), "public", "images") : key.startsWith("storage/gallery/") ? path.join(process.cwd(), "storage", "gallery") : null;
    if (!root) return new NextResponse("Tidak ditemukan.", { status: 404 });
    const file = path.resolve(root, path.basename(key));
    if (!file.startsWith(root + path.sep)) return new NextResponse("Tidak ditemukan.", { status: 404 });
    try { return new NextResponse(await readFile(file), { headers: { "Content-Type": item.mimeType, "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" } }); }
    catch { return new NextResponse("Tidak ditemukan.", { status: 404 }); }
}

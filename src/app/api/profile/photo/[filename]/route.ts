import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const mimeByExtension: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
};

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
    const { filename } = await params;
    const safeName = path.basename(filename);
    const extension = safeName.split(".").pop()?.toLowerCase() ?? "";
    const contentType = mimeByExtension[extension];
    if (!contentType) return new NextResponse("Tidak ditemukan.", { status: 404 });

    try {
        const bytes = await readFile(path.join(process.cwd(), "storage", "profile", safeName));
        return new NextResponse(bytes, { headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=3600" } });
    } catch {
        return new NextResponse("Tidak ditemukan.", { status: 404 });
    }
}

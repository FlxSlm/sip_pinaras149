import { stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";

export function parseByteRange(value: string | null, size: number): { kind: "full" } | { kind: "partial"; start: number; end: number } | { kind: "invalid" } {
    if (!value) return { kind: "full" };
    const match = /^bytes=(\d*)-(\d*)$/.exec(value);
    if (!match || (!match[1] && !match[2]) || size <= 0) return { kind: "invalid" };
    const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
    const end = match[1] && match[2] ? Math.min(size - 1, Number(match[2])) : size - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= size || end < start || (!match[1] && Number(match[2]) <= 0)) return { kind: "invalid" };
    return { kind: "partial", start, end };
}

export async function serveAnnouncementMedia(mediaRef: string | null, request: Request) {
    if (!mediaRef || !mediaRef.startsWith("storage/announcements/")) return new NextResponse("Tidak ditemukan.", { status: 404 });
    const name = path.basename(mediaRef);
    const type = ({ pdf: "application/pdf", mp4: "video/mp4", webm: "video/webm" } as Record<string, string>)[name.split(".").pop()?.toLowerCase() ?? ""];
    if (!type) return new NextResponse("Tidak ditemukan.", { status: 404 });
    try {
        const absolute = path.join(process.cwd(), "storage", "announcements", name);
        const { size } = await stat(absolute);
        const range = parseByteRange(request.headers.get("range"), size);
        const headers: Record<string, string> = { "Content-Type": type, "X-Content-Type-Options": "nosniff", "Accept-Ranges": "bytes", "Cache-Control": "private, no-store", "Content-Disposition": `inline; filename="pengumuman.${name.split(".").pop()}"` };
        if (range.kind === "invalid") return new NextResponse(null, { status: 416, headers: { ...headers, "Content-Range": `bytes */${size}` } });
        const partial = range.kind === "partial";
        const start = partial ? range.start : 0;
        const end = partial ? range.end : size - 1;
        headers["Content-Length"] = String(Math.max(0, end - start + 1));
        if (partial) headers["Content-Range"] = `bytes ${start}-${end}/${size}`;
        const stream = createReadStream(absolute, { start, ...(size > 0 ? { end } : {}) });
        return new NextResponse(Readable.toWeb(stream) as ReadableStream<Uint8Array>, { status: partial ? 206 : 200, headers });
    } catch { return new NextResponse("Tidak ditemukan.", { status: 404 }); }
}

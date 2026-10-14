import { open, mkdir, link, unlink, stat } from "node:fs/promises";
import path from "node:path";
import { parse } from "pg-connection-string";
import { validMediaSignature, validUploadMetadata, type UploadKind } from "@/lib/upload-rules";

// Development files must never become references in a hosted/Neon database.
export function canReadLocalUploads() {
    if (process.env.NODE_ENV !== "development" || process.env.VERCEL) return false;
    try {
        const raw = process.env.DATABASE_URL ?? "";
        const url = new URL(raw);
        const connection = parse(raw);
        return ["postgres:", "postgresql:"].includes(url.protocol)
            && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
            && ["localhost", "127.0.0.1", "::1"].includes(connection.host ?? "");
    } catch { return false; }
}
export function canUseLocalUploads() { return canReadLocalUploads() && !process.env.BLOB_READ_WRITE_TOKEN; }

export function isLocalUploadReference(reference: string) {
    return /^storage\/uploads\/(profile|evidence|pdf|video|structure)\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.(jpg|jpeg|png|webp|pdf|mp4|webm)$/.test(reference);
}
function filePath(reference: string) {
    if (!canReadLocalUploads() || !isLocalUploadReference(reference)) throw new Error("local-storage-disabled");
    const root = path.resolve("storage", "uploads");
    const absolute = path.resolve(reference);
    if (!absolute.startsWith(root + path.sep)) throw new Error("invalid-reference");
    return absolute;
}

export async function readLocalUpload(reference: string) {
    const absolute = filePath(reference);
    const metadata = await stat(absolute);
    if (!metadata.isFile()) throw new Error("invalid-file");
    const handle = await open(absolute, "r");
    const prefix = new Uint8Array(16);
    try {
        const { bytesRead } = await handle.read(prefix, 0, 16, 0);
        const mime = ({ jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", pdf: "application/pdf", mp4: "video/mp4", webm: "video/webm" } as Record<string, string>)[path.extname(reference).slice(1)];
        return { pathname: reference, url: reference, size: metadata.size, contentType: mime, prefix: prefix.subarray(0, bytesRead) };
    } finally { await handle.close(); }
}

export class LocalUploadError extends Error {
    constructor(public status: number, message: string) { super(message); }
}

export async function writeLocalUpload(reference: string, kind: UploadKind, mime: string, size: number, body: ReadableStream<Uint8Array> | null) {
    if (!canUseLocalUploads()) throw new Error("local-storage-disabled");
    const target = filePath(reference);
    if (!body || !reference.startsWith(`storage/uploads/${kind.toLowerCase()}/`) || !validUploadMetadata(kind, reference, mime, size)) throw new LocalUploadError(400, "Metadata lampiran tidak valid.");
    await mkdir(path.dirname(target), { recursive: true });
    const temporary = target + ".pending";
    let handle;
    let ownsTemporary = false;
    const reader = body.getReader();
    try {
        handle = await open(temporary, "wx");
        ownsTemporary = true;
        const prefix = new Uint8Array(16);
        let length = 0, prefixLength = 0;
        while (true) {
            const chunk = await reader.read();
            if (chunk.done) break;
            length += chunk.value.byteLength;
            if (length > size) throw new LocalUploadError(413, "Ukuran lampiran melebihi batas yang diizinkan.");
            const part = chunk.value.subarray(0, 16 - prefixLength);
            prefix.set(part, prefixLength); prefixLength += part.length;
            await handle.writeFile(chunk.value);
        }
        if (length !== size || !validMediaSignature(mime, prefix.subarray(0, prefixLength))) throw new LocalUploadError(400, "Isi atau ukuran file tidak sesuai dengan lampiran.");
        await handle.close(); handle = undefined;
        // Atomic publication without replacing an already-uploaded intent.
        await link(temporary, target);
    } catch (error) {
        if (error instanceof LocalUploadError) throw error;
        if ((error as NodeJS.ErrnoException).code === "EEXIST") throw new LocalUploadError(409, "Lampiran sudah diunggah atau sedang diproses.");
        throw new LocalUploadError(503, "Lampiran belum dapat disimpan.");
    } finally {
        await reader.cancel().catch(() => {});
        if (handle) await handle.close().catch(() => {});
        if (ownsTemporary) await unlink(temporary).catch(() => {});
    }
}

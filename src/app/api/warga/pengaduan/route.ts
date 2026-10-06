import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { complaintInputSchema, createComplaint } from "@/lib/complaints";
import { prisma } from "@/lib/prisma";

const MAX_EVIDENCE_BYTES = 5 * 1024 * 1024;
const allowedEvidenceTypes = new Map([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
]);

function isFile(value: FormDataEntryValue | null): value is File {
    return typeof File !== "undefined" && value instanceof File;
}

function hasValidImageSignature(bytes: Buffer, contentType: string): boolean {
    if (contentType === "image/jpeg") {
        return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    }
    if (contentType === "image/png") {
        return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    }
    return contentType === "image/webp" && bytes.length >= 12 && bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP";
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
    }
    if (session.user.role !== "WARGA") {
        return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
    }

    let formData: FormData;
    try {
        formData = await request.formData();
    } catch {
        return NextResponse.json({ message: "Format permintaan tidak valid." }, { status: 400 });
    }

    const parsed = complaintInputSchema.safeParse({
        title: formData.get("title"),
        category: formData.get("category"),
        description: formData.get("description"),
        location: formData.get("location") || undefined,
    });
    if (!parsed.success) {
        return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Data pengaduan tidak valid." }, { status: 400 });
    }

    const evidenceEntries = formData.getAll("evidence");
    const evidenceFiles: Array<{ path: string; mimeType: string; sizeBytes: number }> = [];
    const storedFilePaths: string[] = [];

    if (evidenceEntries.some((entry) => !isFile(entry) || entry.size === 0)) {
        return NextResponse.json({ message: "Bukti foto tidak valid." }, { status: 400 });
    }
    for (const entry of evidenceEntries) {
        if (!isFile(entry)) continue;
        const extension = allowedEvidenceTypes.get(entry.type);
        if (!extension || entry.size > MAX_EVIDENCE_BYTES) {
            return NextResponse.json({ message: "Bukti harus berupa JPG, PNG, atau WEBP maksimal 5 MB." }, { status: 400 });
        }

        const evidenceBytes = Buffer.from(await entry.arrayBuffer());
        if (!hasValidImageSignature(evidenceBytes, entry.type)) {
            return NextResponse.json({ message: "Isi file bukti tidak sesuai dengan tipe gambarnya." }, { status: 400 });
        }
        const relativePath = path.join("storage", "evidence", `${randomUUID()}.${extension}`);
        const storedFilePath = path.join(process.cwd(), relativePath);
        await mkdir(path.dirname(storedFilePath), { recursive: true });
        await writeFile(storedFilePath, evidenceBytes, { flag: "wx" });
        storedFilePaths.push(storedFilePath);
        evidenceFiles.push({ path: relativePath.replaceAll(path.sep, "/"), mimeType: entry.type, sizeBytes: entry.size });
    }

    try {
        const complaint = await createComplaint(prisma, parsed.data, session.user.id, evidenceFiles);
        return NextResponse.json({ message: "Pengaduan berhasil dikirim.", complaint }, { status: 201 });
    } catch {
        await Promise.all(storedFilePaths.map((filePath) => unlink(filePath).catch(() => undefined)));
        return NextResponse.json({ message: "Pengaduan tidak dapat disimpan." }, { status: 500 });
    }
}

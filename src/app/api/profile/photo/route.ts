import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { del, get, put } from "@vercel/blob";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { validateProfileImage } from "@/lib/image-upload";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user.id) return new NextResponse("Tidak terautentikasi.", { status: 401 });

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { customImage: true },
    });

    if (!user?.customImage) return new NextResponse("Tidak ditemukan.", { status: 404 });

    if (user.customImage.startsWith("storage/profile/")) {
        const name = path.basename(user.customImage);
        const extension = name.split(".").pop() ?? "";
        const mime = ({ jpg: "image/jpeg", png: "image/png", webp: "image/webp" } as Record<string, string>)[extension];
        if (!mime) return new NextResponse("Tidak ditemukan.", { status: 404 });
        try { return new NextResponse(await readFile(path.join(process.cwd(), "storage", "profile", name)), { headers: { "Content-Type": mime, "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store" } }); }
        catch { return new NextResponse("Tidak ditemukan.", { status: 404 }); }
    }

    try {
        const result = await get(user.customImage, { access: "private" });
        if (!result) return new NextResponse("Tidak ditemukan.", { status: 404 });
        if (result.statusCode === 304) return new NextResponse(null, { status: 304 });

        return new NextResponse(result.stream, {
            headers: {
                "Content-Type": result.blob.contentType || "image/jpeg",
                "X-Content-Type-Options": "nosniff",
                "Cache-Control": "private, no-store",
            },
        });
    } catch {
        return new NextResponse("Gagal mengambil foto.", { status: 500 });
    }
}

export async function POST(request: Request) {
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
        const session = await getServerSession(authOptions);
        if (!session?.user.id) return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
        if (!["WARGA", "ADMIN_KELURAHAN"].includes(session.user.role)) return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
        const form = await request.formData().catch(() => null);
        const file = form?.get("photo");
        if (!(file instanceof File) || file.size > 5 * 1024 * 1024) return NextResponse.json({ message: "Pilih JPG, PNG, atau WEBP maksimal 5 MB." }, { status: 400 });
        const bytes = Buffer.from(await file.arrayBuffer());
        const extension = validateProfileImage(file, bytes);
        if (!extension) return NextResponse.json({ message: "Isi atau tipe foto tidak valid." }, { status: 400 });
        const relative = `storage/profile/${randomUUID()}.${extension}`;
        const absolute = path.join(process.cwd(), relative);
        let uploadedBlob: string | null = null;
        try {
            if (process.env.BLOB_READ_WRITE_TOKEN) {
                const blob = await put(`profile/${randomUUID()}.${extension}`, bytes, { access: "private", contentType: file.type });
                uploadedBlob = blob.url;
                await prisma.user.update({ where: { id: session.user.id }, data: { customImage: blob.url } });
                return NextResponse.json({ message: "Foto profil diperbarui." });
            }
            await mkdir(path.dirname(absolute), { recursive: true });
            await writeFile(absolute, bytes, { flag: "wx" });
            await prisma.user.update({ where: { id: session.user.id }, data: { customImage: relative } });
            return NextResponse.json({ message: "Foto profil diperbarui." });
        } catch {
            if (uploadedBlob) await del(uploadedBlob).catch(() => undefined);
            else if (!process.env.BLOB_READ_WRITE_TOKEN) await unlink(absolute).catch(() => undefined);
            return NextResponse.json({ message: "Foto belum dapat disimpan." }, { status: 500 });
        }
    }
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async () => {
                const session = await getServerSession(authOptions);
                if (!session?.user.id) throw new Error("Tidak terautentikasi.");

                return {
                    allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
                    maximumSizeInBytes: 5 * 1024 * 1024,
                    tokenPayload: JSON.stringify({ userId: session.user.id }),
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                if (!tokenPayload) throw new Error("Missing token payload");
                const { userId } = JSON.parse(tokenPayload);
                await prisma.user.update({
                    where: { id: userId },
                    data: { customImage: blob.url },
                });
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message }, { status: 400 });
    }
}

export async function DELETE() {
    const session = await getServerSession(authOptions);
    if (!session?.user.id) {
        return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { customImage: true } });
    if (user?.customImage) {
        try {
            if (user.customImage.startsWith("storage/profile/")) await unlink(path.join(process.cwd(), "storage", "profile", path.basename(user.customImage)));
            else await del(user.customImage);
        } catch {
            // Ignore if blob not found
        }
    }
    await prisma.user.update({ where: { id: session.user.id }, data: { customImage: null } });

    return NextResponse.json({ message: "Foto profil dihapus." });
}

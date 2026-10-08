import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_PDF_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

const mediaRules: Record<string, { extensions: string[]; mimes: string[]; maxBytes: number }> = {
    PDF: { extensions: ["pdf"], mimes: ["application/pdf"], maxBytes: MAX_PDF_BYTES },
    VIDEO: { extensions: ["mp4", "webm"], mimes: ["video/mp4", "video/webm"], maxBytes: MAX_VIDEO_BYTES },
};

const announcementSchema = z.object({
    title: z.string().trim().min(3).max(160),
    content: z.string().trim().min(1).max(20000),
    mediaType: z.enum(["TEXT", "PDF", "VIDEO"]).default("TEXT"),
    isPinned: z.boolean().default(false),
});

function slugify(value: string) {
    return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);
}

function isFile(value: FormDataEntryValue | null): value is File {
    return typeof File !== "undefined" && value instanceof File;
}

function requireAdmin(session: Session | null) {
    return Boolean(session?.user?.id && session.user.role === "ADMIN_KELURAHAN");
}

async function storeMedia(file: File, mediaType: string): Promise<string> {
    const rule = mediaRules[mediaType];
    const extension = rule.extensions[0];
    if (!rule.mimes.includes(file.type) || file.size > rule.maxBytes) {
        throw new Error(`File ${mediaType} tidak valid atau melebihi ukuran.`);
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const relativePath = path.join("storage", "announcements", `${randomUUID()}.${extension}`);
    await mkdir(path.dirname(path.join(process.cwd(), relativePath)), { recursive: true });
    await writeFile(path.join(process.cwd(), relativePath), bytes, { flag: "wx" });
    return relativePath.replaceAll(path.sep, "/");
}

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
    const announcements = await prisma.announcement.findMany({ orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }] });
    return NextResponse.json(announcements);
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });

    const formData = await request.formData().catch(() => null);
    if (!formData) return NextResponse.json({ message: "Format tidak valid." }, { status: 400 });

    const parsed = announcementSchema.safeParse({
        title: formData.get("title"),
        content: formData.get("content"),
        mediaType: formData.get("mediaType") || "TEXT",
        isPinned: formData.get("isPinned") === "on" || formData.get("isPinned") === "true",
    });
    if (!parsed.success) {
        return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });
    }

    let mediaRef: string | null = null;
    if (parsed.data.mediaType !== "TEXT") {
        const file = formData.get("media");
        if (!isFile(file)) {
            return NextResponse.json({ message: `File ${parsed.data.mediaType} wajib diunggah.` }, { status: 400 });
        }
        try {
            mediaRef = await storeMedia(file, parsed.data.mediaType);
        } catch (error) {
            return NextResponse.json({ message: error instanceof Error ? error.message : "Gagal menyimpan media." }, { status: 400 });
        }
    }

    const status = formData.get("status") === "DRAFT" ? "DRAFT" : "PUBLISHED";
    const baseSlug = slugify(parsed.data.title) || "pengumuman";
    const slug = `${baseSlug}-${Date.now().toString(36)}`;
    const announcement = await prisma.announcement.create({
        data: {
            title: parsed.data.title,
            slug,
            content: parsed.data.content,
            mediaType: parsed.data.mediaType,
            mediaRef,
            isPinned: parsed.data.isPinned,
            status,
            publishedAt: status === "PUBLISHED" ? new Date() : null,
            createdById: session!.user!.id,
        },
    });

    if (status === "PUBLISHED") {
        const recipients = await prisma.user.findMany({ where: { id: { not: session!.user!.id } }, select: { id: true } });
        if (recipients.length > 0) {
            await prisma.notification.createMany({
                data: recipients.map((recipient) => ({ recipientId: recipient.id, type: "ANNOUNCEMENT_PUBLISHED" as const, title: "Pengumuman baru", message: announcement.title, announcementId: announcement.id })),
            });
        }
    }

    return NextResponse.json({ message: status === "PUBLISHED" ? "Pengumuman diterbitkan." : "Pengumuman disimpan sebagai draft.", announcement }, { status: 201 });
}

export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });

    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData().catch(() => null);
        if (!formData) return NextResponse.json({ message: "Format tidak valid." }, { status: 400 });
        const id = typeof formData.get("id") === "string" ? formData.get("id") as string : "";
        if (!id) return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });

        const parsed = announcementSchema.safeParse({
            title: formData.get("title"),
            content: formData.get("content"),
            mediaType: formData.get("mediaType") || "TEXT",
            isPinned: formData.get("isPinned") === "on" || formData.get("isPinned") === "true",
        });
        if (!parsed.success) {
            return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });
        }

        const existing = await prisma.announcement.findUnique({ where: { id }, select: { mediaType: true, mediaRef: true } });
        if (!existing) return NextResponse.json({ message: "Pengumuman tidak ditemukan." }, { status: 404 });

        let mediaRef = existing.mediaRef;
        if (parsed.data.mediaType === "TEXT") {
            mediaRef = null;
        } else {
            const file = formData.get("media");
            if (isFile(file) && file.size > 0) {
                try {
                    mediaRef = await storeMedia(file, parsed.data.mediaType);
                } catch (error) {
                    return NextResponse.json({ message: error instanceof Error ? error.message : "Gagal menyimpan media." }, { status: 400 });
                }
            } else if (existing.mediaType !== parsed.data.mediaType || !existing.mediaRef) {
                return NextResponse.json({ message: `File ${parsed.data.mediaType} wajib diunggah.` }, { status: 400 });
            }
        }

        const statusField = formData.get("status");
        const status = statusField === "PUBLISHED" ? "PUBLISHED" : statusField === "DRAFT" ? "DRAFT" : null;

        await prisma.announcement.update({
            where: { id },
            data: {
                title: parsed.data.title,
                content: parsed.data.content,
                mediaType: parsed.data.mediaType,
                isPinned: parsed.data.isPinned,
                mediaRef,
                ...(status === "PUBLISHED" ? { status, publishedAt: new Date() } : status === "DRAFT" ? { status } : {}),
            },
        });
        return NextResponse.json({ message: "Pengumuman diperbarui." });
    }

    let body: { id?: string; action?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: "Format tidak valid." }, { status: 400 });
    }

    if (!body.id) return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });

    if (body.action === "publish" || body.action === "unpublish") {
        const status = body.action === "publish" ? "PUBLISHED" : "DRAFT";
        await prisma.announcement.update({
            where: { id: body.id },
            data: { status, ...(body.action === "publish" ? { publishedAt: new Date() } : {}) },
        });
        return NextResponse.json({ message: "Status diperbarui." });
    }

    return NextResponse.json({ message: "Aksi tidak valid." }, { status: 400 });
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    if (!requireAdmin(session)) return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
    let body: { id?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: "Format tidak valid." }, { status: 400 });
    }
    if (!body.id) return NextResponse.json({ message: "ID tidak valid." }, { status: 400 });
    await prisma.announcement.delete({ where: { id: body.id } });
    return NextResponse.json({ message: "Pengumuman dihapus." });
}

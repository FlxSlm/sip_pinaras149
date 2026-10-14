import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { Announcement, AnnouncementAttachment, AnnouncementStatus } from "@/generated/prisma/client";
import { prepareUploads, consumeUploads, UploadError } from "@/lib/uploads";

const uploadsSchema = z.array(z.object({ id: z.string().min(1).max(100), kind: z.enum(["PDF", "VIDEO"]), name: z.string().trim().min(1).max(200).refine((value) => !/[\u0000-\u001f\\/]/.test(value)) }).strict()).max(8).refine((items) => new Set(items.map((item) => item.id)).size === items.length);
const keptSchema = z.array(z.string().min(1).max(100)).max(8).refine((ids) => new Set(ids).size === ids.length);

export async function saveAnnouncementAttachments(form: FormData, ownerId: string, existing: (Announcement & { attachments?: AnnouncementAttachment[] }) | null, fields: { title: string; content: string; isPinned: boolean; status: AnnouncementStatus }) {
    let uploads, kept;
    try { uploads = uploadsSchema.parse(JSON.parse(String(form.get("attachmentUploads") ?? "[]"))); kept = keptSchema.parse(JSON.parse(String(form.get("retainedAttachmentIds") ?? "[]"))); }
    catch { throw new UploadError("Daftar lampiran tidak valid."); }
    if (uploads.length + kept.length > 8) throw new UploadError("Maksimal 8 lampiran per pengumuman.");
    const retained = kept.map((id) => {
        const item = existing?.attachments?.find((file) => file.id === id);
        if (item) return item;
        if (id === "legacy" && existing?.mediaRef && existing.mediaType !== "TEXT" && !existing.attachments?.length) return { id, name: "Lampiran utama" + (existing.mediaType === "PDF" ? ".pdf" : ".mp4"), mediaType: existing.mediaType, mediaRef: existing.mediaRef, sizeBytes: 0, sortOrder: 0 };
        throw new UploadError("Lampiran bukan milik pengumuman ini.");
    });
    const additions: Array<{ name: string; mediaType: "PDF" | "VIDEO"; mediaRef: string; sizeBytes: number }> = [];
    for (const upload of uploads) {
        const [file] = await prepareUploads(prisma, [upload.id], ownerId, upload.kind);
        additions.push({ name: upload.name, mediaType: upload.kind, mediaRef: file.path, sizeBytes: file.sizeBytes });
    }
    const all = [...retained, ...additions];
    const primary = all[0];
    const slug = fields.title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100) || "pengumuman";
    return prisma.$transaction(async (tx) => {
        for (const kind of ["PDF", "VIDEO"] as const) await consumeUploads(tx, uploads.filter((file) => file.kind === kind).map((file) => file.id), ownerId, kind);
        const publishedAt = fields.status === "PUBLISHED" ? existing?.status === "PUBLISHED" ? existing.publishedAt : new Date() : existing?.publishedAt ?? null;
        const data = { ...fields, publishedAt, mediaType: primary?.mediaType ?? "TEXT" as const, mediaRef: primary?.mediaRef ?? null };
        const item = existing ? await tx.announcement.update({ where: { id: existing.id }, data }) : await tx.announcement.create({ data: { ...data, slug: slug + "-" + crypto.randomUUID(), createdById: ownerId } });
        if (existing) await tx.announcementAttachment.deleteMany({ where: { announcementId: item.id, id: { notIn: kept.filter((id) => id !== "legacy") } } });
        for (const [index, attachment] of retained.entries()) {
            if (attachment.id !== "legacy") await tx.announcementAttachment.update({ where: { id: attachment.id }, data: { sortOrder: index } });
            else await tx.announcementAttachment.create({ data: { announcementId: item.id, name: attachment.name, mediaType: attachment.mediaType, mediaRef: attachment.mediaRef, sizeBytes: attachment.sizeBytes, sortOrder: index } });
        }
        if (additions.length) await tx.announcementAttachment.createMany({ data: additions.map((attachment, index) => ({ ...attachment, announcementId: item.id, sortOrder: retained.length + index })) });
        if (fields.status === "PUBLISHED" && existing?.status !== "PUBLISHED") {
            const users = await tx.user.findMany({ where: { id: { not: ownerId } }, select: { id: true } });
            if (users.length) await tx.notification.createMany({ data: users.map((user) => ({ recipientId: user.id, type: "ANNOUNCEMENT_PUBLISHED", title: "Pengumuman baru", message: fields.title, announcementId: item.id })) });
        }
        return item;
    });
}

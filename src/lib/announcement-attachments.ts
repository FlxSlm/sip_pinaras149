import type { Announcement, AnnouncementAttachment } from "@/generated/prisma/client";
import type { AnnouncementAttachmentView } from "@/lib/announcement-files";

export function attachmentViews(item: Pick<Announcement, "mediaRef" | "mediaType"> & { attachments?: AnnouncementAttachment[] }): AnnouncementAttachmentView[] {
    if (item.attachments?.length) return item.attachments.map(({ id, name, mediaType, sizeBytes }) => ({ id, name, mediaType: mediaType === "VIDEO" ? "VIDEO" : "PDF", sizeBytes }));
    if (item.mediaRef && item.mediaType !== "TEXT") return [{ id: "legacy", name: "Lampiran utama" + (item.mediaType === "PDF" ? ".pdf" : ".mp4"), mediaType: item.mediaType, sizeBytes: 0 }];
    return [];
}

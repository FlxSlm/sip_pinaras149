import { validUploadMetadata } from "@/lib/upload-rules";
export type AnnouncementAttachmentView = { id: string; name: string; mediaType: "PDF" | "VIDEO"; sizeBytes: number };
export function announcementFileKind(file: File): "PDF" | "VIDEO" | null {
    if (validUploadMetadata("PDF", file.name, file.type, file.size)) return "PDF";
    if (validUploadMetadata("VIDEO", file.name, file.type, file.size)) return "VIDEO";
    return null;
}
export function mergeAnnouncementFiles(current: File[], incoming: File[], retainedCount = 0) {
    const files = [...current]; const errors: string[] = [];
    for (const file of incoming) {
        if (!announcementFileKind(file)) { errors.push(`${file.name}: pilih PDF maksimal 10 MB atau MP4/WEBM maksimal 50 MB.`); continue; }
        if (files.some((item) => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified)) continue;
        if (files.length + retainedCount >= 8) { errors.push("Maksimal 8 lampiran per pengumuman."); continue; }
        files.push(file);
    }
    return { files, errors };
}

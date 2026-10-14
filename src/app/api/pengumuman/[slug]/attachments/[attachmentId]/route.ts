import { prisma } from "@/lib/prisma";
import { serveAnnouncementMedia } from "@/lib/announcement-media";
export async function GET(request: Request, { params }: { params: Promise<{ slug: string; attachmentId: string }> }) {
    const { slug, attachmentId } = await params;
    const file = await prisma.announcementAttachment.findFirst({ where: { id: attachmentId, announcement: { slug, status: "PUBLISHED" } }, select: { mediaRef: true } });
    return serveAnnouncementMedia(file?.mediaRef ?? null, request);
}

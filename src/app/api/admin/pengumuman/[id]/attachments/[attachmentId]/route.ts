import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serveAnnouncementMedia } from "@/lib/announcement-media";
export async function GET(request: Request, { params }: { params: Promise<{ id: string; attachmentId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user.id || session.user.role !== "ADMIN_KELURAHAN") return new Response("Akses ditolak.", { status: 403 });
    const { id, attachmentId } = await params;
    const file = await prisma.announcementAttachment.findFirst({ where: { id: attachmentId, announcementId: id }, select: { mediaRef: true } });
    return serveAnnouncementMedia(file?.mediaRef ?? null, request);
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canUseLocalUploads, writeLocalUpload, LocalUploadError } from "@/lib/local-upload-storage";
import { uploadKinds, uploadRoleAllowed, type UploadKind } from "@/lib/upload-rules";

export const runtime = "nodejs";
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!canUseLocalUploads()) return Response.json({ message: "Upload lokal tidak tersedia." }, { status: 404 });
    const session = await getServerSession(authOptions);
    if (!session?.user.id) return Response.json({ message: "Tidak terautentikasi." }, { status: 401 });
    const { id } = await params;
    try {
        const intent = await prisma.uploadIntent.findFirst({ where: { id, ownerId: session.user.id, consumedAt: null, expiresAt: { gt: new Date() } } });
        if (!intent || !uploadKinds.includes(intent.kind as UploadKind) || !uploadRoleAllowed(intent.kind as UploadKind, session.user.role)) return Response.json({ message: "Lampiran tidak tersedia." }, { status: 404 });
        if (request.headers.get("content-type") !== intent.mimeType) return Response.json({ message: "Jenis lampiran tidak sesuai." }, { status: 400 });
        await writeLocalUpload(intent.pathname, intent.kind as UploadKind, intent.mimeType, intent.sizeBytes, request.body);
        return Response.json({ id }, { headers: { "Cache-Control": "private, no-store" } });
    } catch (error) {
        return Response.json({ message: error instanceof LocalUploadError ? error.message : "Upload belum dapat disimpan." }, { status: error instanceof LocalUploadError ? error.status : 503 });
    }
}

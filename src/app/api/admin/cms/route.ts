import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { organizationInputSchema } from "@/lib/organization";
import { getOrganization } from "@/lib/organization-store";
import { prepareUploads, consumeUploads, UploadError } from "@/lib/uploads";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user.id || session.user.role !== "ADMIN_KELURAHAN") return Response.json({ message: "Akses ditolak." }, { status: 403 });
    const { publicMembers } = await getOrganization();
    return Response.json({ members: publicMembers }, { headers: { "Cache-Control": "private, no-store" } });
}
export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user.id || session.user.role !== "ADMIN_KELURAHAN") return Response.json({ message: "Akses ditolak." }, { status: 403 });
    const parsed = organizationInputSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return Response.json({ message: "Struktur tidak valid. CMS hanya mengelola nama dan foto jabatan yang tersedia." }, { status: 400 });
    const ids = parsed.data.members.flatMap((member) => member.imageUploadId ? [member.imageUploadId] : []);
    if (ids.length > 8 || new Set(ids).size !== ids.length) return Response.json({ message: "Maksimal 8 foto berbeda dalam satu penyimpanan." }, { status: 400 });
    try {
        const { members: existing } = await getOrganization();
        const files = await prepareUploads(prisma, ids, session.user.id, "STRUCTURE");
        const photos = new Map(ids.map((id, index) => [id, files[index].path]));
        const members = parsed.data.members.map((member) => ({ id: member.id, name: member.name, photoRef: member.imageUploadId ? photos.get(member.imageUploadId)! : member.removeImage ? null : existing.find((item) => item.id === member.id)?.photoRef ?? null }));
        await prisma.$transaction(async (tx) => {
            await consumeUploads(tx, ids, session.user.id, "STRUCTURE");
            await tx.siteContent.upsert({ where: { key: "struktur" }, create: { key: "struktur", value: { members }, updatedById: session.user.id }, update: { value: { members }, updatedById: session.user.id } });
        });
        revalidatePath("/");
        return Response.json({ message: "Struktur kelurahan tersimpan." });
    } catch (error) { return Response.json({ message: error instanceof UploadError ? error.message : "Struktur belum dapat disimpan." }, { status: error instanceof UploadError ? error.status : 500 }); }
}

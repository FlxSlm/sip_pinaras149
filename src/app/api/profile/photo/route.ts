import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { del, get } from "@vercel/blob";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user.id) return new NextResponse("Tidak terautentikasi.", { status: 401 });

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { customImage: true },
    });

    if (!user?.customImage) return new NextResponse("Tidak ditemukan.", { status: 404 });

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
            await del(user.customImage);
        } catch {
            // Ignore if blob not found
        }
    }
    await prisma.user.update({ where: { id: session.user.id }, data: { customImage: null } });

    return NextResponse.json({ message: "Foto profil dihapus." });
}

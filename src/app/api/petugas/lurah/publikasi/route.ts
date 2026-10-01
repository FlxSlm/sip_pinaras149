import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
    if (session.user.role !== "lurah") return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: "Format permintaan tidak valid." }, { status: 400 });
    }
    if (!body || typeof body !== "object" || typeof (body as { complaintId?: unknown }).complaintId !== "string" || typeof (body as { published?: unknown }).published !== "boolean") {
        return NextResponse.json({ message: "Data publikasi tidak valid." }, { status: 400 });
    }

    const { complaintId, published } = body as { complaintId: string; published: boolean };
    const complaint = await prisma.complaint.findUnique({ where: { id: complaintId }, select: { id: true, handlingStatus: true } });
    if (!complaint) return NextResponse.json({ message: "Pengaduan tidak ditemukan." }, { status: 404 });
    if (published && complaint.handlingStatus !== "SELESAI") {
        return NextResponse.json({ message: "Hanya pengaduan yang selesai dapat dipublikasikan." }, { status: 409 });
    }

    await prisma.$transaction(async (transaction) => {
        await transaction.complaint.update({
            where: { id: complaint.id },
            data: { publicationStatus: published ? "PUBLISHED" : "DRAFT", publishedAt: published ? new Date() : null },
        });
        await transaction.complaintLog.create({
            data: { complaintId: complaint.id, actorUserId: session.user.id, action: published ? "PUBLISHED" : "UNPUBLISHED" },
        });
    });

    return NextResponse.json({ message: published ? "Pengaduan dipublikasikan." : "Publikasi dibatalkan." });
}

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { applyNeighborhoodAction, workflowActionSchema } from "@/lib/neighborhood-workflow";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
    if (session.user.role !== "kepala_lingkungan" || !session.user.lingkunganId) {
        return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
    }

    const complaints = await prisma.complaint.findMany({
        where: { lingkunganId: session.user.lingkunganId },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            ticketNumber: true,
            title: true,
            category: true,
            description: true,
            evidencePath: true,
            evidences: { select: { id: true, path: true, mimeType: true } },
            handlingStatus: true,
            internalNote: true,
            createdAt: true,
            reporter: { select: { name: true, email: true, phone: true } },
            logs: {
                orderBy: { createdAt: "desc" },
                select: { action: true, note: true, fromStatus: true, toStatus: true, createdAt: true },
            },
        },
    });

    return NextResponse.json({ complaints });
}

export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
    if (session.user.role !== "kepala_lingkungan" || !session.user.lingkunganId) {
        return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: "Format permintaan tidak valid." }, { status: 400 });
    }
    const parsed = workflowActionSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ message: "Data tindakan tidak valid." }, { status: 400 });

    try {
        const result = await applyNeighborhoodAction(prisma, parsed.data, session.user.id, session.user.lingkunganId);
        return NextResponse.json({ message: "Tindakan berhasil disimpan.", result });
    } catch (error) {
        if (error instanceof Error && error.message === "COMPLAINT_NOT_FOUND") {
            return NextResponse.json({ message: "Pengaduan tidak ditemukan." }, { status: 404 });
        }
        if (error instanceof Error && error.message === "NOTE_REQUIRED") {
            return NextResponse.json({ message: "Catatan wajib diisi." }, { status: 400 });
        }
        if (error instanceof Error && error.message === "INVALID_TRANSITION") {
            return NextResponse.json({ message: "Status pengaduan tidak sesuai untuk tindakan ini." }, { status: 409 });
        }
        return NextResponse.json({ message: "Tindakan tidak dapat disimpan." }, { status: 500 });
    }
}

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { applyLurahAction, lurahActionSchema } from "@/lib/lurah-workflow";
import { prisma } from "@/lib/prisma";

const lurahStatuses = ["DITERUSKAN_KE_LURAH", "DALAM_PROSES", "SELESAI", "DI_LUAR_KEWENANGAN"] as const;

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
    if (session.user.role !== "lurah") return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });

    const complaints = await prisma.complaint.findMany({
        where: { handlingStatus: { in: [...lurahStatuses] } },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            ticketNumber: true,
            title: true,
            category: true,
            description: true,
            handlingStatus: true,
            internalNote: true,
            officialResponse: true,
            respondedAt: true,
            createdAt: true,
            lingkungan: { select: { name: true, code: true } },
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
    if (session.user.role !== "lurah") return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: "Format permintaan tidak valid." }, { status: 400 });
    }
    const parsed = lurahActionSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ message: "Data tindakan tidak valid." }, { status: 400 });

    try {
        const result = await applyLurahAction(prisma, parsed.data, session.user.id);
        return NextResponse.json({ message: "Tindakan berhasil disimpan.", result });
    } catch (error) {
        if (error instanceof Error && error.message === "COMPLAINT_NOT_FOUND") {
            return NextResponse.json({ message: "Pengaduan tidak ditemukan." }, { status: 404 });
        }
        if (error instanceof Error && error.message === "RESPONSE_REQUIRED") {
            return NextResponse.json({ message: "Respon resmi wajib diisi." }, { status: 400 });
        }
        if (error instanceof Error && error.message === "INVALID_TRANSITION") {
            return NextResponse.json({ message: "Status pengaduan tidak sesuai untuk tindakan ini." }, { status: 409 });
        }
        return NextResponse.json({ message: "Tindakan tidak dapat disimpan." }, { status: 500 });
    }
}

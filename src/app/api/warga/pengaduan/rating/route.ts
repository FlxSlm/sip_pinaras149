import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ratingSchema = z.object({
    complaintId: z.string().trim().min(1),
    rating: z.number().int().min(1).max(5),
});

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
    if (session.user.role !== "warga") return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: "Format permintaan tidak valid." }, { status: 400 });
    }

    const parsed = ratingSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ message: "Rating harus berupa angka 1 sampai 5." }, { status: 400 });

    try {
        await prisma.$transaction(async (transaction) => {
            const complaint = await transaction.complaint.findFirst({
                where: { id: parsed.data.complaintId, reporterUserId: session.user.id },
                select: { id: true, rating: true, handlingStatus: true },
            });

            if (!complaint) throw new Error("COMPLAINT_NOT_FOUND");
            if (complaint.handlingStatus !== "SELESAI") throw new Error("COMPLAINT_NOT_FINISHED");
            if (complaint.rating !== null) throw new Error("ALREADY_RATED");

            await transaction.complaint.update({
                where: { id: complaint.id },
                data: { rating: parsed.data.rating, ratedAt: new Date() },
            });
            await transaction.complaintLog.create({
                data: { complaintId: complaint.id, actorUserId: session.user.id, action: "RATED", note: `Rating ${parsed.data.rating}/5` },
            });
        });
    } catch (error) {
        if (error instanceof Error && error.message === "COMPLAINT_NOT_FOUND") {
            return NextResponse.json({ message: "Pengaduan tidak ditemukan atau bukan milik Anda." }, { status: 404 });
        }
        if (error instanceof Error && error.message === "COMPLAINT_NOT_FINISHED") {
            return NextResponse.json({ message: "Rating tersedia setelah pengaduan selesai." }, { status: 409 });
        }
        if (error instanceof Error && error.message === "ALREADY_RATED") {
            return NextResponse.json({ message: "Pengaduan ini sudah diberi rating." }, { status: 409 });
        }
        return NextResponse.json({ message: "Rating tidak dapat disimpan." }, { status: 500 });
    }

    return NextResponse.json({ message: "Terima kasih atas rating Anda." });
}
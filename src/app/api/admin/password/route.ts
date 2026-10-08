import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user.id || session.user.role !== "ADMIN_KELURAHAN") {
        return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
    }

    let body: { currentPassword?: string; newPassword?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: "Format tidak valid." }, { status: 400 });
    }

    const currentPassword = body.currentPassword ?? "";
    const newPassword = body.newPassword ?? "";
    if (newPassword.length < 8) {
        return NextResponse.json({ message: "Password baru minimal 8 karakter." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { passwordHash: true } });
    if (!user?.passwordHash || !verifyPassword(currentPassword, user.passwordHash)) {
        return NextResponse.json({ message: "Password saat ini salah." }, { status: 400 });
    }

    await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash: hashPassword(newPassword) } });
    return NextResponse.json({ message: "Password berhasil diperbarui." });
}

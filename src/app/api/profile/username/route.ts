import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isReservedUsername, usernameSchema } from "@/lib/username";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
    if (session.user.role !== "warga") return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { username: true } });
    if (!user) return NextResponse.json({ message: "Pengguna tidak ditemukan." }, { status: 404 });
    return NextResponse.json(user);
}

export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
    if (session.user.role !== "warga") return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: "Format permintaan tidak valid." }, { status: 400 });
    }

    const parsed = usernameSchema.safeParse((body as { username?: unknown })?.username);
    if (!parsed.success) return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Username tidak valid." }, { status: 400 });
    if (isReservedUsername(parsed.data)) return NextResponse.json({ message: "Username tersebut tidak dapat digunakan." }, { status: 400 });

    try {
        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: { username: parsed.data },
            select: { username: true },
        });
        return NextResponse.json({ ...user, message: "Username diperbarui." });
    } catch (error) {
        if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
            return NextResponse.json({ message: "Username sudah digunakan." }, { status: 409 });
        }
        return NextResponse.json({ message: "Username tidak dapat diperbarui." }, { status: 500 });
    }
}
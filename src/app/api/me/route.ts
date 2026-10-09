import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user.id) return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, email: true, username: true, image: true, customImage: true, role: true },
    });
    if (!user) return NextResponse.json({ message: "Tidak ditemukan." }, { status: 404 });

    return NextResponse.json({
        ...user,
        image: user.customImage ? "/api/profile/photo" : user.image,
    });
}

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user.id) return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
    const notifications = await prisma.notification.findMany({
        where: { recipientId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, title: true, message: true, readAt: true, createdAt: true },
    });
    return NextResponse.json({ notifications, unreadCount: notifications.filter((item) => !item.readAt).length });
}

export async function PATCH() {
    const session = await getServerSession(authOptions);
    if (!session?.user.id) return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
    await prisma.notification.updateMany({ where: { recipientId: session.user.id, readAt: null }, data: { readAt: new Date() } });
    return NextResponse.json({ message: "Notifikasi ditandai sudah dibaca." });
}

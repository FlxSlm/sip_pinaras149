import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const announcementSchema = z.object({ title: z.string().trim().min(3).max(160), content: z.string().trim().min(1).max(20000), isPinned: z.boolean().default(false) });

function slugify(value: string) { return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100); }

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user.id || !["kepala_lingkungan", "lurah"].includes(session.user.role)) return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
    let body: unknown;
    try { body = await request.json(); } catch { return NextResponse.json({ message: "Format permintaan tidak valid." }, { status: 400 }); }
    const parsed = announcementSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ message: "Judul dan isi pengumuman wajib diisi." }, { status: 400 });
    const baseSlug = slugify(parsed.data.title) || "pengumuman";
    const slug = `${baseSlug}-${Date.now().toString(36)}`;
    const announcement = await prisma.announcement.create({ data: { ...parsed.data, slug, createdById: session.user.id, published: true } });
    const recipients = await prisma.user.findMany({ where: { id: { not: session.user.id } }, select: { id: true } });
    if (recipients.length > 0) await prisma.notification.createMany({ data: recipients.map((recipient) => ({ recipientId: recipient.id, type: "ANNOUNCEMENT_PUBLISHED" as const, title: "Pengumuman baru", message: announcement.title, announcementId: announcement.id })) });
    return NextResponse.json({ announcement }, { status: 201 });
}

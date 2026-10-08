import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_BYTES = 5 * 1024 * 1024;
const allowedTypes = new Map([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
]);

function isFile(value: FormDataEntryValue | null): value is File {
    return typeof File !== "undefined" && value instanceof File;
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user.id) {
        return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
    }

    const formData = await request.formData().catch(() => null);
    if (!formData) return NextResponse.json({ message: "Format tidak valid." }, { status: 400 });
    const file = formData.get("photo");
    if (!isFile(file) || file.size === 0) return NextResponse.json({ message: "Foto tidak valid." }, { status: 400 });
    const extension = allowedTypes.get(file.type);
    if (!extension || file.size > MAX_BYTES) {
        return NextResponse.json({ message: "Foto harus JPG, PNG, atau WEBP maksimal 5 MB." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const relativePath = path.join("storage", "profile", `${randomUUID()}.${extension}`);
    const absolutePath = path.join(process.cwd(), relativePath);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, bytes, { flag: "wx" });

    const image = `/api/profile/photo/${path.basename(relativePath)}`;
    await prisma.user.update({ where: { id: session.user.id }, data: { image } });

    return NextResponse.json({ message: "Foto profil diperbarui.", image });
}

export async function DELETE() {
    const session = await getServerSession(authOptions);
    if (!session?.user.id) {
        return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
    }
    await prisma.user.update({ where: { id: session.user.id }, data: { image: null } });
    return NextResponse.json({ message: "Foto profil dihapus." });
}

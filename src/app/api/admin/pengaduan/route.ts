import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminActionSchema, applyAdminAction } from "@/lib/admin-workflow";

const errorStatus: Record<string, number> = {
    COMPLAINT_NOT_FOUND: 404,
    INVALID_TRANSITION: 400,
    PRIORITY_REQUIRED: 400,
    NOTE_REQUIRED: 400,
};

export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user.id) {
        return NextResponse.json({ message: "Tidak terautentikasi." }, { status: 401 });
    }
    if (session.user.role !== "ADMIN_KELURAHAN") {
        return NextResponse.json({ message: "Akses ditolak." }, { status: 403 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: "Format permintaan tidak valid." }, { status: 400 });
    }

    const parsed = adminActionSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Aksi tidak valid." }, { status: 400 });
    }

    try {
        const result = await applyAdminAction(prisma, parsed.data, session.user.id);
        return NextResponse.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Aksi tidak dapat diproses.";
        return NextResponse.json({ message }, { status: errorStatus[message] ?? 400 });
    }
}

import { readFile } from "node:fs/promises";
import path from "node:path";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessComplaint } from "@/lib/access";

export async function GET(_request: Request, { params }: { params: Promise<{ ticketNumber: string; evidenceId: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user.id) return new NextResponse("Tidak terautentikasi.", { status: 401 });
    const { ticketNumber, evidenceId } = await params;
    const complaint = await prisma.complaint.findUnique({
        where: { ticketNumber },
        select: { reporterUserId: true, evidences: { where: { id: evidenceId }, select: { path: true, mimeType: true } } },
    });
    if (!complaint || complaint.evidences.length === 0) return new NextResponse("Bukti tidak ditemukan.", { status: 404 });
    const allowed = canAccessComplaint({ id: session.user.id, role: session.user.role }, complaint);
    if (!allowed) return new NextResponse("Akses ditolak.", { status: 403 });
    try {
        const evidence = complaint.evidences[0];
        const bytes = await readFile(path.join(process.cwd(), "storage", "evidence", path.basename(evidence.path)));
        return new NextResponse(bytes, { headers: { "Content-Type": evidence.mimeType, "Cache-Control": "private, max-age=60" } });
    } catch {
        return new NextResponse("Bukti tidak tersedia.", { status: 404 });
    }
}

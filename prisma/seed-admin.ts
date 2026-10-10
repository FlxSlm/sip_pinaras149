import type { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";

export async function seedAdmin(prisma: Pick<PrismaClient, "user">, password: string | undefined) {
    const existing = await prisma.user.findUnique({
        where: { username: "admin.pinaras" },
        select: { id: true, role: true, passwordHash: true },
    });
    if (existing) {
        if (existing.role !== "ADMIN_KELURAHAN" || !existing.passwordHash) {
            throw new Error("Akun admin.pinaras sudah ada tetapi bukan akun admin yang valid. Tidak ada kredensial atau role yang diubah.");
        }
        return { id: existing.id, created: false };
    }
    if (!password || password.length < 8) {
        throw new Error("ADMIN_SEED_PASSWORD wajib diatur dan minimal 8 karakter untuk membuat akun admin baru.");
    }
    const admin = await prisma.user.create({
        data: { username: "admin.pinaras", name: "Admin Kelurahan Pinaras", role: "ADMIN_KELURAHAN", passwordHash: hashPassword(password) },
        select: { id: true },
    });
    return { id: admin.id, created: true };
}

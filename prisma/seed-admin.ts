import type { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";
import { ADMIN_USERNAME } from "../src/lib/admin-account";

export async function seedAdmin(prisma: Pick<PrismaClient, "user">, password: string | undefined) {
    const existing = await prisma.user.findUnique({
        where: { username: ADMIN_USERNAME },
        select: { id: true, role: true, passwordHash: true },
    });
    if (existing) {
        if (existing.role !== "ADMIN_KELURAHAN" || !/^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(existing.passwordHash ?? "")) {
            throw new Error("Akun admin sudah ada tetapi bukan akun admin yang valid. Tidak ada kredensial atau role yang diubah.");
        }
        return { id: existing.id, created: false };
    }
    const legacy = await prisma.user.findUnique({ where: { username: "admin.pinaras" }, select: { id: true } });
    if (legacy) throw new Error("Akun admin lama masih ada. Terapkan migrasi username sebelum inisialisasi; password lama tidak diubah.");
    if (!password || password.trim().length < 12 || password.length > 256) {
        throw new Error("ADMIN_SEED_PASSWORD wajib diatur, minimal 12 karakter non-spasi, dan maksimal 256 karakter untuk membuat akun admin baru.");
    }
    const admin = await prisma.user.create({
        data: { username: ADMIN_USERNAME, name: "Admin Kelurahan Pinaras", role: "ADMIN_KELURAHAN", passwordHash: hashPassword(password) },
        select: { id: true },
    });
    return { id: admin.id, created: true };
}

import { loadEnvConfig } from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { Pool } from "pg";
import { seedAdmin } from "./seed-admin";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production", { info() {}, error() {} });
async function main() {
    const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
    if (!connectionString) throw new Error("Missing database configuration");
    const pool = new Pool({ connectionString, connectionTimeoutMillis: 5000, max: 1 });
    const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
    try {
        const result = await seedAdmin(prisma, process.env.ADMIN_SEED_PASSWORD);
        console.log(result.created ? "Admin berhasil diinisialisasi." : "Admin yang ada dipertahankan tanpa perubahan.");
    } finally { await prisma.$disconnect(); await pool.end(); }
}
main().catch(() => { console.error("Inisialisasi admin gagal. Periksa konfigurasi password atau akun yang sudah ada; detail rahasia tidak dicetak."); process.exitCode = 1; });

import { randomBytes, scryptSync } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient, UserRole } from "../src/generated/prisma/client";

const connectionString =
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/sip_pinaras?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function hashPassword(password: string): string {
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(password, salt, 64).toString("hex");
    return `scrypt:${salt}:${hash}`;
}

async function main() {
    const lurah = await prisma.user.upsert({
        where: { username: "lurah.pinaras" },
        update: {
            name: "Lurah Pinaras",
            role: UserRole.lurah,
            passwordHash: hashPassword("lurah123"),
        },
        create: {
            username: "lurah.pinaras",
            name: "Lurah Pinaras",
            role: UserRole.lurah,
            passwordHash: hashPassword("lurah123"),
        },
    });

    const environments = [];
    for (let index = 1; index <= 8; index += 1) {
        const code = `L${String(index).padStart(2, "0")}`;
        const name = `Lingkungan ${String(index).padStart(2, "0")}`;
        const lingkungan = await prisma.lingkungan.upsert({
            where: { code },
            update: { name, active: true },
            create: { code, name },
        });
        environments.push(lingkungan);

        await prisma.user.upsert({
            where: { username: `kepala.${code.toLowerCase()}` },
            update: {
                name: `Kepala Lingkungan ${String(index).padStart(2, "0")}`,
                role: UserRole.kepala_lingkungan,
                lingkunganId: lingkungan.id,
                passwordHash: hashPassword("kepala123"),
            },
            create: {
                username: `kepala.${code.toLowerCase()}`,
                name: `Kepala Lingkungan ${String(index).padStart(2, "0")}`,
                role: UserRole.kepala_lingkungan,
                lingkunganId: lingkungan.id,
                passwordHash: hashPassword("kepala123"),
            },
        });
    }

    await prisma.user.upsert({
        where: { username: "warga.contoh" },
        update: { name: "Warga Contoh", role: UserRole.warga, lingkunganId: environments[0].id },
        create: {
            username: "warga.contoh",
            name: "Warga Contoh",
            role: UserRole.warga,
            lingkunganId: environments[0].id,
        },
    });

    console.log(`Seeded ${environments.length} lingkungan, 1 lurah, 8 kepala lingkungan, and 1 warga.`);
    console.log(`Lurah seed id: ${lurah.id}`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
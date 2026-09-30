import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from "pg";

const connectionString =
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/sip_pinaras?schema=public";

const globalForPrisma = globalThis as unknown as {
    pool: Pool | undefined;
    prisma: PrismaClient | undefined;
};

const pool =
    globalForPrisma.pool ??
    new Pool({
        connectionString,
    });

export const prisma =
    globalForPrisma.prisma ?? new PrismaClient({ adapter: new PrismaPg(pool) });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
    globalForPrisma.prisma = prisma;
}
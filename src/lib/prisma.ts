import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString && process.env.NODE_ENV !== "test") throw new Error("DATABASE_URL wajib dikonfigurasi.");

const globalForPrisma = globalThis as unknown as {
    pool: Pool | undefined;
    prisma: PrismaClient | undefined;
};

const pool =
    globalForPrisma.pool ??
    new Pool({
        connectionString,
        max: 3,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        allowExitOnIdle: true,
    });

export const prisma =
    globalForPrisma.prisma ?? new PrismaClient({ adapter: new PrismaPg(pool) });

globalForPrisma.pool = pool;
globalForPrisma.prisma = prisma;

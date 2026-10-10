import { loadEnvConfig } from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { verifyPassword } from "../src/lib/password";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Read-only diagnosis. Never print environment values, records, hashes, or errors.
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production", { info() {}, error() {} });

async function main() {
  const configured = (key: string) => Boolean(process.env[key]);
  console.log(JSON.stringify({
    environment: {
      databaseConfigured: configured("DATABASE_URL"),
      authSecretConfigured: configured("AUTH_SECRET") || configured("NEXTAUTH_SECRET"),
      authSecretAliasesAgree: !configured("AUTH_SECRET") || !configured("NEXTAUTH_SECRET") || process.env.AUTH_SECRET === process.env.NEXTAUTH_SECRET,
      googleConfigured: configured("AUTH_GOOGLE_ID") && configured("AUTH_GOOGLE_SECRET"),
      seedPasswordConfigured: configured("ADMIN_SEED_PASSWORD"),
      seedPasswordMeetsMinimum: (process.env.ADMIN_SEED_PASSWORD?.length ?? 0) >= 8,
      authUrlConfigured: configured("NEXTAUTH_URL"),
      authUrlUsesHttps: process.env.NEXTAUTH_URL?.startsWith("https://") ?? false,
    },
  }));
  if (!process.env.DATABASE_URL) {
    console.log(JSON.stringify({ database: "not-checked-missing-configuration" }));
    process.exitCode = 1;
    return;
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  try {
    const admin = await prisma.user.findUnique({ where: { username: "admin.pinaras" }, select: { role: true, passwordHash: true } });
    const nonCanonicalAdminCount = await prisma.user.count({ where: { username: { equals: "admin.pinaras", mode: "insensitive", not: "admin.pinaras" } } });
    const googleAccounts = await prisma.account.count({ where: { provider: "google" } });
    const googleAccountsWithWrongRole = await prisma.account.count({ where: { provider: "google", user: { role: { not: "WARGA" } } } });
    const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'User'`;
    const expectedColumns = ["id", "username", "name", "email", "emailVerified", "image", "customImage", "passwordHash", "role", "createdAt", "updatedAt"];
    const migrations = await prisma.$queryRaw<Array<{ migration_name: string; checksum: string; finished: boolean; rolled_back: boolean }>>`SELECT migration_name, checksum, finished_at IS NOT NULL AS finished, rolled_back_at IS NOT NULL AS rolled_back FROM "_prisma_migrations" ORDER BY started_at`;
    console.log(JSON.stringify({
      database: "connected",
      missingUserColumns: expectedColumns.filter((name) => !columns.some((column) => column.column_name === name)),
      migrations: migrations.map((migration) => {
        let matchesFile = false;
        try { matchesFile = createHash("sha256").update(readFileSync(join(process.cwd(), "prisma", "migrations", migration.migration_name, "migration.sql"))).digest("hex") === migration.checksum; } catch { /* Missing migration is reported without paths or values. */ }
        return { name: migration.migration_name, finished: migration.finished, rolledBack: migration.rolled_back, matchesFile };
      }),
      admin: {
        exists: Boolean(admin),
        expectedRole: admin?.role === "ADMIN_KELURAHAN",
        passwordHashPresent: Boolean(admin?.passwordHash),
        supportedHashFormat: Boolean(admin?.passwordHash?.match(/^scrypt:[0-9a-f]{32}:[0-9a-f]{128}$/)),
        matchesConfiguredSeedPassword: admin?.passwordHash && process.env.ADMIN_SEED_PASSWORD ? verifyPassword(process.env.ADMIN_SEED_PASSWORD, admin.passwordHash) : null,
        nonCanonicalIdentifierExists: nonCanonicalAdminCount > 0,
      },
      google: { linkedAccounts: googleAccounts, accountsWithUnexpectedRole: googleAccountsWithWrongRole },
    }));
  } catch {
    console.log(JSON.stringify({ database: "diagnosis-failed-no-secrets-logged" }));
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(() => { console.log("Diagnosis failed; secret details withheld."); process.exitCode = 1; });

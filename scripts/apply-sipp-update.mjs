// Explicit, guarded migration runner. No secrets are printed or stored in files.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { parse } from "dotenv";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const req = createRequire(import.meta.url);
const emit = process.stdout.write.bind(process.stdout);
process.stdout.write = () => true; process.stderr.write = () => true;
const { require: tsxRequire } = req("tsx/cjs/api");
const { PrismaClient } = tsxRequire(path.resolve("src/generated/prisma/client.ts"), import.meta.url);
const target = process.argv[process.argv.indexOf("--target") + 1];
const apply = process.argv.includes("--apply");
const migration = "20261014000000_sipp_usability_security";
const result = { targetVerified: false, accountVerified: false, existingMigrationsVerified: false, migrationApplied: false };
let pool, db, before;
try {
    if (!["local", "neon"].includes(target)) throw new Error("target-required");
    const values = parse(fs.readFileSync(target === "neon" ? ".env.vercel-production.local" : ".env.local"));
    const runtime = values.DATABASE_URL;
    const direct = target === "neon" ? values.DIRECT_URL : values.DIRECT_URL ?? values.DATABASE_URL;
    if (!runtime || !direct) throw new Error("file-configuration-missing");
    const first = new URL(runtime), second = new URL(direct);
    const parseConnection = req("pg-connection-string").parse;
    const runtimeConfig = parseConnection(runtime), directConfig = parseConnection(direct);
    if (!["postgres:", "postgresql:"].includes(first.protocol) || !["postgres:", "postgresql:"].includes(second.protocol)) throw new Error("invalid-url");
    if (target === "neon") {
        if (!first.hostname.endsWith(".neon.tech") || !second.hostname.endsWith(".neon.tech") || !runtimeConfig.host.endsWith(".neon.tech") || !directConfig.host.endsWith(".neon.tech") || second.hostname.split(".")[0].endsWith("-pooler") || runtimeConfig.host.replace(/-pooler\./, ".") !== directConfig.host || runtimeConfig.database !== "neondb" || directConfig.database !== "neondb") throw new Error("neon-target-mismatch");
    } else if (!["localhost", "127.0.0.1", "[::1]"].includes(first.hostname) || !["localhost", "127.0.0.1", "[::1]"].includes(second.hostname) || !["localhost", "127.0.0.1", "::1"].includes(directConfig.host) || runtimeConfig.database !== directConfig.database) throw new Error("local-target-mismatch");
    result.targetVerified = true;
    pool = new Pool({ connectionString: direct, max: 1, connectionTimeoutMillis: 5000 }); pool.on("error", () => {});
    db = new PrismaClient({ adapter: new PrismaPg(pool), log: [] });
    const accounts = await db.user.findMany({ where: { username: { in: ["admin.pinaras", "kkt149unsrat@pinaras.com"] } }, select: { id: true, username: true, role: true, passwordHash: true } });
    if (accounts.length !== 1 || accounts[0].role !== "ADMIN_KELURAHAN") throw new Error("account-missing-or-collision");
    before = accounts[0]; result.accountVerified = true;
    const records = await db.$queryRawUnsafe('SELECT "migration_name", "checksum", "finished_at", "rolled_back_at" FROM "_prisma_migrations"');
    const applied = records.filter((row) => row.finished_at && !row.rolled_back_at);
    if (records.some((row) => !row.finished_at && !row.rolled_back_at)) throw new Error("failed-migration-record");
    const folders = fs.readdirSync("prisma/migrations", { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => item.name);
    for (const folder of folders.filter((name) => name !== migration)) {
        const row = applied.find((item) => item.migration_name === folder);
        const sql = fs.readFileSync(path.join("prisma/migrations", folder, "migration.sql"), "utf8");
        const variants = [sql, sql.replace(/\r\n/g, "\n"), sql.replace(/\r?\n/g, "\r\n")];
        if (!row && target === "local" && folder === "20261010010000_persistent_upload_intents") {
            const [state] = await db.$queryRawUnsafe('SELECT to_regclass(\'"UploadIntent"\') IS NULL AS missing');
            if (state.missing) { result.requiredPendingUploadMigration = true; continue; }
        }
        if (!row || !variants.some((value) => crypto.createHash("sha256").update(value).digest("hex") === row.checksum)) {
            result.migrationObstacle = { migration: folder, reason: row ? "checksum-mismatch" : "not-recorded-as-applied" };
            throw new Error("existing-migration-mismatch");
        }
    }
    if (applied.some((row) => !folders.includes(row.migration_name))) throw new Error("unknown-applied-migration");
    result.existingMigrationsVerified = true;
    if (apply) {
        const child = spawn(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], { cwd: process.cwd(), env: { ...process.env, DATABASE_URL: runtime, DIRECT_URL: direct, NODE_ENV: "production" }, stdio: "ignore", windowsHide: true });
        const [code] = await once(child, "exit");
        if (code !== 0) throw new Error("migration-deploy-failed");
        const after = await db.user.findUnique({ where: { username: "kkt149unsrat@pinaras.com" }, select: { id: true, role: true, passwordHash: true } });
        result.migrationApplied = true;
        result.accountIdentityPreserved = after?.id === before.id;
        result.adminRolePreserved = after?.role === before.role;
        result.passwordPreserved = after?.passwordHash === before.passwordHash;
        const schema = await db.$queryRawUnsafe('SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = \'Complaint\' AND column_name = \'neighborhood\') AS complaint_ready, to_regclass(\'"AnnouncementAttachment"\') IS NOT NULL AS attachments_ready, to_regclass(\'"AdminLoginThrottle"\') IS NOT NULL AS throttle_ready');
        result.newSchemaVerified = schema[0].complaint_ready && schema[0].attachments_ready && schema[0].throttle_ready;
        if (!result.accountIdentityPreserved || !result.passwordPreserved || !result.adminRolePreserved || !result.newSchemaVerified) throw new Error("post-migration-verification-failed");
        if (after) after.passwordHash = null;
    }
} catch (error) {
    const allowed = ["target-required", "file-configuration-missing", "invalid-url", "neon-target-mismatch", "local-target-mismatch", "account-missing-or-collision", "failed-migration-record", "existing-migration-mismatch", "unknown-applied-migration", "migration-deploy-failed", "post-migration-verification-failed"];
    result.obstacle = allowed.includes(error.message) ? error.message : "configuration-or-connection-failed"; process.exitCode = 1;
} finally {
    if (before) before.passwordHash = null;
    if (db) await db.$disconnect().catch(() => {});
    if (pool) await pool.end().catch(() => {});
    emit(JSON.stringify(result) + "\n");
}

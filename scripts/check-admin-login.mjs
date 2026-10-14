import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { parse } from "dotenv";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const emit = process.stdout.write.bind(process.stdout);
process.stdout.write = () => true;
process.stderr.write = () => true;
const req = createRequire(import.meta.url);
const { require: tsxRequire } = req("tsx/cjs/api");
const { PrismaClient } = tsxRequire(path.resolve("src/generated/prisma/client.ts"), import.meta.url);
const { verifyPassword } = tsxRequire(path.resolve("src/lib/password.ts"), import.meta.url);
const verify = process.argv.includes("--password-stdin");
let password = null;
if (verify) {
    let input = "";
    try {
        process.stdin.setEncoding("utf8");
        for await (const chunk of process.stdin) { input += chunk; if (input.length > 4096) throw new Error("invalid"); }
        password = JSON.parse(input);
        if (typeof password !== "string" || !password.length || password.length > 256) throw new Error("invalid");
    } catch { password = null; emit('{"passwordInputValid":false}\n'); process.exitCode = 1; }
    finally { input = ""; }
    if (password === null) process.exit(1);
}
const result = {};
const hashes = [];
for (const [target, file] of [["local", ".env.local"], ["neon", ".env.vercel-production.local"]]) {
    let db, pool;
    try {
        const values = parse(fs.readFileSync(file));
        if (!values.DATABASE_URL) throw new Error("missing");
        const config = req("pg-connection-string").parse(values.DATABASE_URL);
        const host = new URL(values.DATABASE_URL).hostname;
        if (target === "local" ? !["localhost", "127.0.0.1", "[::1]"].includes(host) || !["localhost", "127.0.0.1", "::1"].includes(config.host) : !host.endsWith(".neon.tech") || !config.host.endsWith(".neon.tech")) throw new Error("target-mismatch");
        pool = new Pool({ connectionString: values.DATABASE_URL, max: 1, connectionTimeoutMillis: 5000 });
        pool.on("error", () => {});
        db = new PrismaClient({ adapter: new PrismaPg(pool), log: [] });
        await db.$queryRawUnsafe("SELECT 1");
        const user = await db.user.findUnique({ where: { username: "kkt149unsrat@pinaras.com" }, select: { id: true, role: true, passwordHash: true } });
        const state = user ? await db.adminLoginThrottle.findUnique({ where: { userId: user.id }, select: { failedAttempts: true, blockedUntil: true } }) : null;
        result[target] = { connection: true, accountFound: Boolean(user), roleMatches: user?.role === "ADMIN_KELURAHAN", hashFormatValid: /^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(user?.passwordHash ?? ""), failedAttempts: state?.failedAttempts ?? 0, currentlyBlocked: Boolean(state?.blockedUntil && state.blockedUntil.getTime() > Date.now()) };
        if (verify) result[target].passwordMatches = user?.role === "ADMIN_KELURAHAN" && user.passwordHash ? verifyPassword(password, user.passwordHash) : null;
        hashes.push(user?.passwordHash ?? null);
        if (user) user.passwordHash = null;
    } catch { result[target] = { connectionOrInspectionFailed: true }; hashes.push(null); }
    finally { if (db) await db.$disconnect().catch(() => {}); if (pool) await pool.end().catch(() => {}); }
}
result.storedHashesIdentical = hashes.every(Boolean) ? hashes[0] === hashes[1] : null;
hashes.fill(null);
password = null;
emit(JSON.stringify(result) + "\n");

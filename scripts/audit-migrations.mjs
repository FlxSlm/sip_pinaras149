import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { Pool } from "pg";
import { createHash } from "node:crypto";
const target = (await readFile(".deployment-qa/test-database-url", "utf8")).trim();
const parsed = new URL(target);
if (!["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname) || !/^\/sipp_preview_audit_[a-f0-9]+$/.test(parsed.pathname)) throw new Error("Unsafe audit target");
const env = {...process.env, DATABASE_URL:target, DIRECT_URL:target};
const probe = new Pool({connectionString:target,connectionTimeoutMillis:5000});
try {
 const tables = await probe.query("SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'");
 console.log(JSON.stringify({auditStartedEmpty:tables.rows[0].count===0,initialTableCount:tables.rows[0].count}));
} finally {await probe.end();}
const cli = "node_modules/prisma/build/index.js";
const run = (args) => spawnSync(process.execPath, [cli, ...args], {env, encoding:"utf8"});
const deploy = run(["migrate", "deploy"]);
console.log(JSON.stringify({node:process.version, isolatedMigrationDeployExit:deploy.status}));
if (deploy.status !== 0) { console.log((deploy.stderr + deploy.stdout).split("\n").filter(line => /Error:|P[0-9]{4}|Database error code|ERROR:/.test(line)).join("\n")); process.exit(1); }
const again = run(["migrate", "deploy"]);
console.log(JSON.stringify({secondDeployExit:again.status}));
const diff = run(["migrate", "diff", "--from-config-datasource", "--to-schema", "prisma/schema.prisma", "--script"]);
const clean = run(["migrate", "diff", "--from-config-datasource", "--to-schema", "prisma/schema.prisma", "--exit-code"]);
await writeFile(".deployment-qa/schema-diff.sql", diff.stdout);
console.log(JSON.stringify({schemaDiffExit:diff.status, schemaMatchesSchema:clean.status===0, schemaDiff:diff.stdout.trim()}));
const pool = new Pool({connectionString:target,connectionTimeoutMillis:5000});
try {
 const history = await pool.query('SELECT migration_name, checksum, finished_at IS NOT NULL AS finished, rolled_back_at IS NOT NULL AS rolled_back FROM "_prisma_migrations" ORDER BY started_at');
 const migrations = await Promise.all(history.rows.map(async m => ({name:m.migration_name, finished:m.finished, rolledBack:m.rolled_back, checksumMatches:createHash("sha256").update(await readFile("prisma/migrations/"+m.migration_name+"/migration.sql")).digest("hex")===m.checksum})));
 const custom = await pool.query("SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='customImage'");
 console.log(JSON.stringify({migrations, customImagePresent:custom.rowCount===1}));
 if(again.status!==0 || clean.status!==0 || diff.status!==0 || migrations.some(m=>!m.finished || m.rolledBack || !m.checksumMatches)) process.exitCode=1;
} finally { await pool.end(); }

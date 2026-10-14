import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
loadEnvConfig(process.cwd(), true, { info() {}, error() {} });
async function main() {
 const source = new URL(process.env.DATABASE_URL ?? "");
 if (!["localhost", "127.0.0.1", "[::1]"].includes(source.hostname)) throw new Error("NON_LOCAL");
 const pool = new Pool({connectionString: source.toString(), connectionTimeoutMillis:5000});
 try {
  const name = "sipp_preview_audit_" + randomBytes(6).toString("hex");
  await pool.query('CREATE DATABASE "' + name + '"');
  source.pathname = "/" + name;
  source.searchParams.set("schema", "public");
  await mkdir(".deployment-qa", {recursive:true});
  await writeFile(".deployment-qa/test-database-url", source.toString());
  console.log(JSON.stringify({isolatedDatabaseCreated:true, localOnly:true, existingDatabaseUnchanged:true}));
 } finally { await pool.end(); }
}
main().catch(() => { console.log("Isolated database setup failed; no secrets logged."); process.exitCode=1; });

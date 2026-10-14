import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import path from "node:path";
const secret="synthetic-test-secret-with-at-least-32-characters";
const baseline={...process.env,DATABASE_URL:"postgresql://fixture:fixture@managed.example.invalid/sipp?sslmode=require",DIRECT_URL:"",AUTH_SECRET:secret,NEXTAUTH_SECRET:"",AUTH_GOOGLE_ID:"synthetic-id",AUTH_GOOGLE_SECRET:"synthetic-google-secret",BLOB_READ_WRITE_TOKEN:"synthetic-blob-token",NEXTAUTH_URL:"https://preview.example.invalid"};
const run=(patch:Record<string,string>)=>spawnSync(process.execPath,[path.resolve("scripts/check-deployment-env.mjs")],{env:{...baseline,...patch},encoding:"utf8"});
describe("Vercel deployment environment gate",()=>{
 it("accepts complete format only on Node 24",()=>{expect(run({}).status).toBe(process.version.startsWith("v24.")?0:1);});
 it("missing Blob configuration blocks build without exposing secrets",()=>{const result=run({BLOB_READ_WRITE_TOKEN:""});expect(result.status).toBe(1);expect(result.stderr).toContain("BLOB_READ_WRITE_TOKEN");expect(result.stderr).not.toContain(secret);});
 it("localhost authentication URL is rejected for deployment",()=>{expect(run({NEXTAUTH_URL:"http://localhost:3000"}).status).toBe(1);});
 it("conflicting secret aliases are rejected",()=>{expect(run({NEXTAUTH_SECRET:"different-synthetic-secret-at-least-32"}).status).toBe(1);});
});

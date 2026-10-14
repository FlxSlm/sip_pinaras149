// Real upload roundtrip on a disposable localhost database and private development files.
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { parse } from "dotenv";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { chromium } from "@playwright/test";
import { encode } from "next-auth/jwt";
const req = createRequire(import.meta.url);
const { require: tsxRequire } = req("tsx/cjs/api");
const { PrismaClient } = tsxRequire(path.resolve("src/generated/prisma/client.ts"), import.meta.url);
const { isLocalUploadReference } = tsxRequire(path.resolve("src/lib/local-upload-storage.ts"), import.meta.url);
const dbName = "sipp_upload_" + crypto.randomBytes(6).toString("hex");
const origin = "http://127.0.0.1:3111";
const workspace = process.cwd();
const serverRoot = path.resolve(".ui-qa", "local-upload", dbName);
const secret = crypto.randomBytes(32).toString("hex");
const result = { localOnly: true, checks: [] };
const assert = (value, label) => { if (!value) throw new Error(label); result.checks.push(label); };
let sourcePool, testPool, db, browser, server, created = false, stage = "configuration";
async function run(args, env) { const child = spawn(process.execPath, args, { env, stdio: "ignore", windowsHide: true }); const [code] = await once(child, "exit"); if (code !== 0) throw new Error("command-failed"); }
try {
    const values = parse(await fs.readFile(".env.local"));
    const url = new URL(values.DATABASE_URL);
    const connection = req("pg-connection-string").parse(values.DATABASE_URL);
    if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) || !["localhost", "127.0.0.1", "::1"].includes(connection.host)) throw new Error("unsafe-target");
    sourcePool = new Pool({ connectionString: values.DATABASE_URL, max: 1, connectionTimeoutMillis: 5000 });
    await sourcePool.query('CREATE DATABASE "' + dbName + '"'); created = true;
    url.pathname = "/" + dbName;
    url.searchParams.delete("database"); url.searchParams.delete("dbname");
    if (req("pg-connection-string").parse(url.href).database !== dbName) throw new Error("unsafe-test-database");
    const env = { ...process.env, DATABASE_URL: url.href, DIRECT_URL: url.href, NODE_ENV: "development", VERCEL: "", BLOB_READ_WRITE_TOKEN: "", AUTH_SECRET: secret, NEXTAUTH_SECRET: secret, NEXTAUTH_URL: origin, NEXT_TELEMETRY_DISABLED: "1" };
    stage = "migration";
    await run(["node_modules/prisma/build/index.js", "migrate", "deploy"], env);
    testPool = new Pool({ connectionString: url.href, max: 2 }); db = new PrismaClient({ adapter: new PrismaPg(testPool), log: [] });
    const admin = await db.user.create({ data: { username: "upload-test", name: "Admin Uji", role: "ADMIN_KELURAHAN" } });
    // A source snapshot avoids the .next/dev lock of the user's localhost server.
    await fs.mkdir(serverRoot, { recursive: true });
    for (const folder of ["src", "public"]) await fs.cp(folder, path.join(serverRoot, folder), { recursive: true });
    for (const file of ["package.json", "tsconfig.json", "next.config.ts", "postcss.config.mjs"]) await fs.copyFile(file, path.join(serverRoot, file));
    await fs.symlink(path.resolve("node_modules"), path.join(serverRoot, "node_modules"), "junction");
    server = spawn(process.execPath, [path.resolve("node_modules/next/dist/bin/next"), "dev", "--port", "3111", "--hostname", "127.0.0.1"], { cwd: serverRoot, env, stdio: "ignore", windowsHide: true });
    stage = "server";
    let ready = false;
    for (let i = 0; i < 90; i++) { if (server.exitCode !== null) throw new Error("server-exited"); try { if ((await fetch(origin + "/login", { signal: AbortSignal.timeout(10000) })).ok) { ready = true; break; } } catch {} await new Promise((resolve) => setTimeout(resolve, 500)); }
    if (!ready) throw new Error("server-not-ready");
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const token = await encode({ secret, token: { userId: admin.id, role: "ADMIN_KELURAHAN", name: "Admin Uji" } });
    await context.addCookies([{ name: "next-auth.session-token", value: token, url: origin }]);
    const page = await context.newPage();
    await page.goto(origin + "/admin/pengumuman");
    await page.getByRole("button", { name: "Buat pengumuman" }).waitFor();
    const options = await page.getByRole("combobox", { name: "Status publikasi" }).locator("option").allTextContents();
    assert(JSON.stringify(options) === JSON.stringify(["Semua", "Terbit", "Draft"]), "only-three-admin-filters");
    stage = "generate-playable-video";
    const videoBytes = await page.evaluate(async () => {
        const canvas = document.createElement("canvas"); canvas.width = 320; canvas.height = 180;
        const draw = () => { const c = canvas.getContext("2d"); c.fillStyle = "#075985"; c.fillRect(0, 0, 320, 180); c.fillStyle = "white"; c.fillText("SIPP video test", 30, 90); };
        draw(); const stream = canvas.captureStream(10); const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
        const chunks = []; recorder.ondataavailable = (event) => chunks.push(event.data);
        const stopped = new Promise((resolve) => { recorder.onstop = resolve; }); recorder.start();
        const timer = setInterval(draw, 50); await new Promise((resolve) => setTimeout(resolve, 500)); recorder.stop(); await stopped;
        clearInterval(timer); stream.getTracks().forEach((track) => track.stop());
        return Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer()));
    });
    stage = "browser-upload";
    await page.getByRole("button", { name: "Buat pengumuman" }).click();
    await page.getByLabel("Judul", { exact: true }).fill("Video lokal pengujian");
    await page.getByLabel("Isi pengumuman", { exact: true }).fill("Pengujian video dan PDF.");
    await page.getByLabel("Pilih lampiran pengumuman").setInputFiles([
        { name: "video.webm", mimeType: "video/webm", buffer: Buffer.from(videoBytes) },
        { name: "dokumen.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\nsynthetic test\n%%EOF") },
    ]);
    await page.getByRole("button", { name: "Simpan pengumuman", exact: true }).click();
    await page.getByRole("button", { name: "Ya, lanjutkan" }).click();
    await page.getByRole("status").filter({ hasText: "Pengumuman disimpan." }).waitFor({ timeout: 60000 });
    const item = await db.announcement.findFirst({ include: { attachments: { orderBy: { sortOrder: "asc" } } } });
    assert(item?.attachments.length === 2, "video-and-pdf-saved-together");
    const video = item.attachments.find((file) => file.mediaType === "VIDEO");
    const adminUrl = origin + `/api/admin/pengumuman/${item.id}/attachments/${video.id}`;
    assert((await context.request.get(adminUrl)).status() === 200, "admin-can-read-uploaded-video");
    assert((await fetch(adminUrl)).status === 403, "guest-cannot-read-admin-video");
    const publicUrl = origin + `/api/pengumuman/${item.slug}/attachments/${video.id}`;
    assert((await fetch(publicUrl)).status === 404, "draft-video-not-public");
    await context.request.patch(origin + "/api/admin/pengumuman", { data: { id: item.id, action: "publish" } });
    assert((await fetch(publicUrl)).status === 200, "published-video-available");
    const partial = await fetch(publicUrl, { headers: { Range: "bytes=0-15" } });
    assert(partial.status === 206 && (await partial.arrayBuffer()).byteLength === 16, "video-range-streaming");
    const playback = await page.evaluate(async (url) => { const video = document.createElement("video"); video.preload = "metadata"; const loaded = new Promise((resolve) => { video.onloadedmetadata = () => resolve(video.videoWidth === 320); video.onerror = () => resolve(false); setTimeout(() => resolve(false), 10000); }); video.src = url; document.body.append(video); const result = await loaded; video.remove(); return result; }, publicUrl);
    assert(playback, "browser-loads-real-video-metadata");
    await context.request.patch(origin + "/api/admin/pengumuman", { data: { id: item.id, action: "unpublish" } });
    assert((await fetch(publicUrl)).status === 404, "unpublish-revokes-public-video");
    stage = "large-video";
    const large = Buffer.alloc(12 * 1024 * 1024); large.write("ftyp", 4, "ascii");
    const largeIntent = await (await context.request.post(origin + "/api/uploads", { data: { kind: "VIDEO", name: "large.mp4", mimeType: "video/mp4", sizeBytes: large.length } })).json();
    const uploaded = await context.request.put(origin + largeIntent.uploadUrl, { headers: { "Content-Type": "video/mp4" }, data: large });
    assert(uploaded.status() === 200, "video-upload-over-ten-megabytes");
    assert((await context.request.put(origin + largeIntent.uploadUrl, { headers: { "Content-Type": "video/mp4" }, data: large })).status() === 409, "uploaded-intent-cannot-be-overwritten");
    stage = "closed-complaint-feedback";
    const warga = await db.user.create({ data: { name: "Pelapor Uji", role: "WARGA" } });
    for (const [status, message] of [["SELESAI", "Pengaduan ini sudah selesai."], ["DITOLAK", "Pengaduan ini telah ditolak."]]) {
        const complaint = await db.complaint.create({ data: { ticketNumber: "UI-" + status, reporterUserId: warga.id, title: "Pengaduan pengujian", category: "Infrastruktur", description: "Data pengujian antarmuka.", status } });
        await page.goto(origin + "/admin/pengaduan/" + complaint.ticketNumber);
        await page.getByText(message, { exact: true }).waitFor();
        assert(await page.getByRole("button", { name: "Selesaikan", exact: true }).count() === 0 && await page.getByRole("button", { name: "Tolak", exact: true }).count() === 0, "closed-complaint-specific-feedback-" + status);
    }
    stage = "structure-photo-picker";
    await page.goto(origin + "/admin/konten");
    const chooserEvent = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: "Pilih Foto untuk Lurah", exact: true }).click();
    const chooser = await chooserEvent;
    const pngBase64 = await page.evaluate(() => { const canvas = document.createElement("canvas"); canvas.width = 32; canvas.height = 32; const c = canvas.getContext("2d"); c.fillStyle = "#075985"; c.fillRect(0, 0, 32, 32); return canvas.toDataURL("image/png").split(",")[1]; });
    await chooser.setFiles({ name: "foto-uji.png", mimeType: "image/png", buffer: Buffer.from(pngBase64, "base64") });
    await page.getByText("Dipilih: foto-uji.png", { exact: true }).waitFor();
    assert(await page.locator('input[type="file"]').first().isHidden(), "native-file-picker-hidden-behind-indonesian-button");
    await page.getByRole("button", { name: "Simpan struktur", exact: true }).click();
    await page.getByRole("status").filter({ hasText: "Struktur kelurahan tersimpan." }).waitFor({ timeout: 60000 });
    const structure = await db.siteContent.findUnique({ where: { key: "struktur" } });
    assert(Boolean(structure.value.members.find((member) => member.id === "lurah").photoRef), "structure-photo-upload-and-save");
    const photoResponse = await fetch(origin + "/api/struktur/lurah/photo");
    assert(photoResponse.ok && photoResponse.headers.get("content-type") === "image/png" && Buffer.from(await photoResponse.arrayBuffer()).equals(Buffer.from(pngBase64, "base64")), "structure-photo-public-projection-reads-saved-image");
    stage = "completed";
} catch { result.failedStage = stage; process.exitCode = 1; }
finally {
    if (browser) await browser.close().catch(() => {});
    if (server) { server.kill(); await Promise.race([once(server, "exit"), new Promise((resolve) => setTimeout(resolve, 2000))]); }
    if (db) {
        const files = await db.uploadIntent.findMany({ select: { pathname: true } }).catch(() => []);
        for (const file of files) if (isLocalUploadReference(file.pathname) && path.resolve(serverRoot, file.pathname).startsWith(path.resolve(serverRoot, "storage", "uploads") + path.sep)) await fs.unlink(path.resolve(serverRoot, file.pathname)).catch(() => {});
        await db.$disconnect().catch(() => {});
    }
    if (testPool) await testPool.end().catch(() => {});
    if (created && /^sipp_upload_[a-f0-9]{12}$/.test(dbName)) await sourcePool.query('DROP DATABASE "' + dbName + '" WITH (FORCE)').catch(() => { result.cleanupFailed = true; });
    if (sourcePool) await sourcePool.end().catch(() => {});
    if (serverRoot.startsWith(path.resolve(workspace, ".ui-qa", "local-upload") + path.sep) && /^sipp_upload_[a-f0-9]{12}$/.test(path.basename(serverRoot))) {
        await fs.unlink(path.join(serverRoot, "node_modules")).catch(() => {});
        await fs.rm(serverRoot, { recursive: true, force: true }).catch(() => { result.cleanupFailed = true; });
    }
    await fs.mkdir(".ui-qa/local-upload", { recursive: true }); await fs.writeFile(".ui-qa/local-upload/report.json", JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result));
}

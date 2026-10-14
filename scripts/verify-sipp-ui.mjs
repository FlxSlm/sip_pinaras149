// Uses a disposable LOCAL database. Never loads Neon or Vercel credentials.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { once } from "node:events";
import { parse } from "dotenv";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { chromium } from "@playwright/test";
import { encode } from "next-auth/jwt";

const req = createRequire(import.meta.url);
const { require: tsxRequire } = req("tsx/cjs/api");
const { PrismaClient } = tsxRequire(path.resolve("src/generated/prisma/client.ts"), import.meta.url);
const { hashPassword } = tsxRequire(path.resolve("src/lib/password.ts"), import.meta.url);
const { verifyAdminLogin } = tsxRequire(path.resolve("src/lib/admin-login.ts"), import.meta.url);
const workspace = process.cwd();
const origin = "http://127.0.0.1:3107";
const dbName = "sipp_ui_" + crypto.randomBytes(6).toString("hex");
const secret = crypto.randomBytes(32).toString("hex");
const password = crypto.randomBytes(24).toString("hex");
const adminUsername = "kkt149unsrat@pinaras.com";
const result = { localOnly: true, build: false, checks: [], screenshots: [] };
let stage = "local-configuration", sourcePool, testPool, db, browser, server, activePage, created = false;
const assert = (condition, label) => { if (!condition) { result.failedCheck = label; throw new Error(label); } result.checks.push(label); };
async function command(args, env) {
    const child = spawn(process.execPath, args, { cwd: workspace, env, stdio: "ignore", windowsHide: true });
    const [code] = await once(child, "exit");
    if (code !== 0) throw new Error("command-failed");
}
async function waitServer() {
    for (let attempt = 0; attempt < 60; attempt++) {
        if (server.exitCode !== null) throw new Error("server-exited");
        try { const response = await fetch(origin + "/login"); if (response.ok) return; } catch { /* server is starting */ }
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    throw new Error("server-timeout");
}
async function noOverflow(page, label) {
    const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    assert(!overflows, label);
}
async function screen(page, name) {
    await page.waitForFunction(() => Array.from(document.images).filter((img) => { const bounds = img.getBoundingClientRect(); return bounds.width > 0 && bounds.height > 0 && bounds.top < window.innerHeight && bounds.bottom > 0; }).every((img) => img.complete), undefined, { timeout: 10000 });
    const target = path.join(".ui-qa", "sipp-improvements", name + ".png");
    await page.screenshot({ path: target, fullPage: true, animations: "disabled" }); result.screenshots.push(target);
}

try {
    const parsed = parse(fs.readFileSync(".env.local"));
    const source = new URL(parsed.DATABASE_URL ?? "");
    const connection = req("pg-connection-string").parse(parsed.DATABASE_URL ?? "");
    if (!["localhost", "127.0.0.1", "[::1]"].includes(source.hostname) || !["localhost", "127.0.0.1", "::1"].includes(connection.host)) throw new Error("non-local-target");
    sourcePool = new Pool({ connectionString: source.href, max: 1, connectionTimeoutMillis: 5000 });
    await sourcePool.query('CREATE DATABASE "' + dbName + '"'); created = true;
    source.pathname = "/" + dbName;
    const env = { ...process.env, DATABASE_URL: source.href, DIRECT_URL: source.href, AUTH_SECRET: secret, NEXTAUTH_SECRET: secret, NEXTAUTH_URL: origin, NODE_ENV: "production", VERCEL: "", TSX_DISABLE_CACHE: "1", NEXT_TELEMETRY_DISABLED: "1" };
    stage = "isolated-migration";
    await command(["node_modules/prisma/build/index.js", "migrate", "deploy"], env);
    testPool = new Pool({ connectionString: source.href, max: 2, connectionTimeoutMillis: 5000 });
    db = new PrismaClient({ adapter: new PrismaPg(testPool), log: [] });
    const admin = await db.user.create({ data: { username: adminUsername, name: "Admin Uji", role: "ADMIN_KELURAHAN", passwordHash: hashPassword(password) } });
    const warga = await db.user.create({ data: { name: "Warga Uji", email: "warga@example.invalid", role: "WARGA" } });
    const concurrent = await db.user.create({ data: { username: "parallel-fixture", name: "Uji Paralel", role: "ADMIN_KELURAHAN", passwordHash: hashPassword(password) } });
    await Promise.all(Array.from({ length: 5 }, () => verifyAdminLogin(db, concurrent.id, password + "-incorrect", concurrent.passwordHash)));
    assert((await db.adminLoginThrottle.findUnique({ where: { userId: concurrent.id } })).failedAttempts === 5, "concurrent-failures-count-exactly-once");
    await db.statistic.create({ data: { label: "Luas wilayah", value: "3,98", unit: "km²", source: "BPS", sourceYear: "2020" } });
    for (const [index, status] of ["MENUNGGU", "DIPROSES", "SELESAI", "DITOLAK"].entries()) await db.complaint.create({ data: { reporterUserId: warga.id, ticketNumber: "LPR-TEST-" + index, title: "Pengaduan uji " + index, category: "Kebersihan", description: "Data tiruan untuk pengujian", status, neighborhood: 3 } });
    const announcement = await db.announcement.create({ data: { slug: "uji-draft", title: "Pengumuman uji", content: "Data pengujian", createdById: admin.id, mediaType: "PDF", mediaRef: "sipp/pdf/00000000-0000-0000-0000-000000000000.pdf" } });
    const attachment = await db.announcementAttachment.create({ data: { announcementId: announcement.id, name: "uji.pdf", mediaType: "PDF", mediaRef: announcement.mediaRef, sizeBytes: 10 } });
    stage = "production-build";
    if (!process.argv.includes("--reuse-build")) {
        await command(["scripts/prepare-pdf-worker.mjs"], env);
        await command(["node_modules/next/dist/bin/next", "build"], env);
    }
    result.build = true;
    stage = "browser-start";
    server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3107"], { cwd: workspace, env, stdio: "ignore", windowsHide: true });
    await waitServer();
    fs.mkdirSync(path.join(".ui-qa", "sipp-improvements"), { recursive: true });
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 850 }, serviceWorkers: "block" });
    const page = await context.newPage();
    activePage = page;
    const hydrationErrors = [];
    page.on("pageerror", (error) => { result.browserErrorKinds ??= []; result.browserErrorKinds.push(["TypeError", "ReferenceError", "SyntaxError"].includes(error.name) ? error.name : "runtime"); if (/hydration|server rendered|matching|React error/i.test(error.message)) hydrationErrors.push(true); });
    page.on("console", (message) => { if (message.type() === "error" && /hydration|server rendered|matching|React error/i.test(message.text())) hydrationErrors.push(true); });
    stage = "responsive-login";
    for (const width of [320, 390, 768, 1280]) {
        await page.setViewportSize({ width, height: 850 }); await page.goto(origin + "/login");
        await noOverflow(page, "login-no-overflow-" + width);
        const brand = await page.getByText("Sistem Informasi Peduli Pinaras", { exact: true }).boundingBox();
        const title = await page.getByRole("heading", { name: "SIPP", exact: true }).boundingBox();
        assert(brand && title && brand.y + brand.height < title.y, "login-header-does-not-overlap-" + width);
        if (width === 390) await screen(page, "login-mobile");
    }
    stage = "public-structure";
    const publicResponse = await page.goto(origin + "/");
    result.publicHttpStatus = publicResponse.status();
    await page.getByRole("heading", { name: "Struktur Kelurahan Pinaras" }).waitFor();
    assert(await page.getByRole("heading", { name: "Struktur Kelurahan Pinaras" }).count() === 1, "public-structure-present");
    assert(await page.locator("#struktur").getByText("JANTJE A. ERING", { exact: true }).count() === 1, "reference-names-present");
    assert(await page.getByText("3,96", { exact: false }).count() > 0, "updated-area-visible");
    assert((await db.statistic.findFirst()).value === "3,98", "original-source-data-preserved");
    for (const width of [320, 768, 1440]) { await page.setViewportSize({ width, height: 900 }); await noOverflow(page, "public-no-overflow-" + width); }
    await screen(page, "public-desktop");
    const blockedFile = await context.request.get(origin + "/api/pengumuman/uji-draft/attachments/" + attachment.id);
    assert(blockedFile.status() === 404, "draft-attachment-not-public");
    stage = "real-admin-login";
    await page.goto(origin + "/login");
    assert(await page.getByPlaceholder("Username admin").inputValue() === "", "admin-username-not-disclosed-or-prefilled");
    const login = async (value) => { await page.getByPlaceholder("Username admin").fill(adminUsername); await page.locator('input[type="password"]').fill(value); await page.getByRole("button", { name: "Masuk →" }).click(); };
    for (let i = 0; i < 4; i++) {
        await login(password + "-incorrect"); await page.getByRole("alert").filter({ hasText: "Username atau password tidak valid" }).waitFor();
        await page.getByRole("status").filter({ hasText: `Sisa percobaan sebelum jeda: ${4 - i}.` }).waitFor();
        assert(true, "server-attempts-remaining-" + (4 - i));
    }
    await login(password + "-incorrect"); await page.getByRole("alert").filter({ hasText: "Terlalu banyak" }).waitFor();
    const state = await db.adminLoginThrottle.findUnique({ where: { userId: admin.id } });
    assert(state.failedAttempts === 5 && state.blockedUntil > new Date(), "fifth-failure-locks-real-database");
    assert(await page.getByRole("button", { name: "Menunggu jeda login" }).isDisabled(), "login-shows-countdown");
    for (const [failures, seconds] of [[6, 180], [7, 540]]) {
        await db.adminLoginThrottle.update({ where: { userId: admin.id }, data: { blockedUntil: new Date(0) } });
        await page.goto(origin + "/login"); await login(password + "-incorrect");
        await page.getByRole("alert").filter({ hasText: "Terlalu banyak" }).waitFor();
        const escalated = await db.adminLoginThrottle.findUnique({ where: { userId: admin.id } });
        const delay = escalated.blockedUntil.getTime() - Date.now();
        assert(escalated.failedAttempts === failures && delay > (seconds - 10) * 1000 && delay <= seconds * 1000, "real-cooldown-" + seconds + "-seconds");
    }
    await db.adminLoginThrottle.update({ where: { userId: admin.id }, data: { blockedUntil: new Date(0) } });
    await page.goto(origin + "/login"); await login(password); await page.waitForURL(origin + "/admin");
    assert((await db.adminLoginThrottle.findUnique({ where: { userId: admin.id } })).failedAttempts === 0, "successful-login-clears-counter");
    await page.waitForSelector(".chart-visual");
    assert(hydrationErrors.length === 0, "admin-chart-no-hydration-error");
    await screen(page, "admin-desktop");
    stage = "client-navigation";
    await page.evaluate(() => { window.__sippNavigationMarker = "same-document"; });
    await page.getByRole("link", { name: "Struktur Kelurahan", exact: true }).click();
    await page.waitForURL(origin + "/admin/konten"); await page.getByRole("heading", { name: "Struktur Kelurahan", exact: true }).waitFor();
    assert(await page.evaluate(() => window.__sippNavigationMarker === "same-document"), "navigation-keeps-document");
    const nameInput = page.getByRole("textbox", { name: "Nama pejabat" }).first();
    await nameInput.fill("PEJABAT UJI"); await page.getByRole("button", { name: "Simpan struktur" }).click();
    await page.getByRole("status").filter({ hasText: "tersimpan" }).waitFor();
    assert(Boolean(await db.siteContent.findUnique({ where: { key: "struktur" } })), "structure-edit-persisted");
    const deniedCms = await context.request.patch(origin + "/api/admin/cms", { data: { section: "hero", value: {} } });
    assert(deniedCms.status() === 400, "old-cms-sections-disabled");
    await page.goto(origin + "/"); assert(await page.getByText("PEJABAT UJI", { exact: true }).count() === 1, "structure-edit-visible-publicly");
    stage = "announcement-drag-drop";
    await page.goto(origin + "/admin/pengumuman"); await page.getByRole("button", { name: "Buat pengumuman" }).click();
    const transfer = await page.evaluateHandle(() => { const value = new DataTransfer(); value.items.add(new File(["%PDF-fixture"], "one.pdf", { type: "application/pdf" })); value.items.add(new File(["%PDF-fixture"], "two.pdf", { type: "application/pdf" })); return value; });
    result.dragFixtureFileCount = await transfer.evaluate((value) => value.files.length);
    await page.getByText("Tarik dan letakkan file di sini").locator("..").dispatchEvent("drop", { dataTransfer: transfer });
    await page.getByText(/one\.pdf.*baru/).waitFor();
    await page.getByText(/two\.pdf.*baru/).waitFor();
    assert(await page.getByText(/one\.pdf.*baru/).count() === 1 && await page.getByText(/two\.pdf.*baru/).count() === 1, "multiple-files-added-by-drag-drop");
    await context.close();
    stage = "warga-complaint-heic";
    const wargaContext = await browser.newContext({ viewport: { width: 390, height: 850 }, serviceWorkers: "block" });
    const token = await encode({ secret, token: { userId: warga.id, role: "WARGA", name: "Warga Uji" } });
    await wargaContext.addCookies([{ name: "next-auth.session-token", value: token, url: origin }]);
    const citizenPage = await wargaContext.newPage();
    activePage = citizenPage;
    await citizenPage.goto(origin + "/warga/pengaduan/buat");
    assert(await citizenPage.locator("#neighborhood option").count() === 10, "eight-neighborhoods-and-unknown");
    await citizenPage.locator("#neighborhood").selectOption("UNKNOWN");
    await noOverflow(citizenPage, "warga-form-no-overflow-mobile");
    await citizenPage.locator('input[type="file"]').setInputFiles("public/images/airterjun_tumimperas.HEIC");
    await citizenPage.getByText(/airterjun_tumimperas\.jpg/).waitFor({ timeout: 60000 });
    assert(await citizenPage.locator('img[alt="airterjun_tumimperas.jpg"]').count() === 1, "real-heic-conversion-preview");
    await screen(citizenPage, "warga-mobile-heic");
    const forbidden = await wargaContext.request.patch(origin + "/api/admin/cms", { data: {} });
    assert(forbidden.status() === 403, "warga-cannot-edit-structure");
    await wargaContext.close(); stage = "completed";
} catch {
    result.failedStage = stage; process.exitCode = 1;
    if (activePage && !activePage.isClosed()) await activePage.screenshot({ path: path.join(".ui-qa", "sipp-improvements", "failure.png"), fullPage: true, animations: "disabled" }).catch(() => {});
} finally {
    if (browser) await browser.close().catch(() => {});
    if (server) { server.kill(); await Promise.race([once(server, "exit"), new Promise((resolve) => setTimeout(resolve, 2000))]); }
    if (db) await db.$disconnect().catch(() => {});
    if (testPool) await testPool.end().catch(() => {});
    if (created && /^sipp_ui_[a-f0-9]{12}$/.test(dbName)) await sourcePool.query('DROP DATABASE "' + dbName + '" WITH (FORCE)').catch(() => { result.cleanupFailed = true; });
    if (sourcePool) await sourcePool.end().catch(() => {});
    fs.mkdirSync(path.join(".ui-qa", "sipp-improvements"), { recursive: true });
    fs.writeFileSync(path.join(".ui-qa", "sipp-improvements", "report.json"), JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result));
}

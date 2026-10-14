// Vercel build gate. Presence/format only; never log secret values.
const missing = [];
for (const key of ["DATABASE_URL", "AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET", "BLOB_READ_WRITE_TOKEN", "NEXTAUTH_URL"]) if (!process.env[key]) missing.push(key);
const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
if (!secret || secret.length < 32) missing.push("AUTH_SECRET (atau NEXTAUTH_SECRET, minimal 32 karakter)");
if (process.env.AUTH_SECRET && process.env.NEXTAUTH_SECRET && process.env.AUTH_SECRET !== process.env.NEXTAUTH_SECRET) missing.push("AUTH_SECRET/NEXTAUTH_SECRET tidak konsisten");
if (!process.version.startsWith("v24.")) missing.push("Node.js 24.x");
try { const url = new URL(process.env.NEXTAUTH_URL ?? ""); if (url.protocol !== "https:" || url.pathname !== "/" || url.search || url.hash || url.username || url.password) missing.push("NEXTAUTH_URL harus origin HTTPS"); } catch { missing.push("NEXTAUTH_URL tidak valid"); }
for (const key of ["DATABASE_URL", "DIRECT_URL"]) if (process.env[key]) { try { const url = new URL(process.env[key]); if (!["postgres:", "postgresql:"].includes(url.protocol) || ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) missing.push(key + " harus PostgreSQL terkelola"); } catch { missing.push(key + " tidak valid"); } }
if (missing.length) { console.error("Konfigurasi deployment belum lengkap: " + [...new Set(missing)].join(", ")); process.exitCode = 1; }
else console.log("Konfigurasi deployment memenuhi pemeriksaan format; koneksi layanan masih perlu diuji.");

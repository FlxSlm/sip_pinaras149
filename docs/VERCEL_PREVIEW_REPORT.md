# Hasil persiapan Preview Vercel — SIPP V2

Tanggal pengguna: 10 Oktober 2026. Repository aktual: C:\kkt_project.
Status: persiapan kode selesai dan verifikasi lokal berhasil. Konfigurasi layanan
eksternal serta uji end-to-end di domain Preview masih harus dilakukan.
Tidak melakukan deployment, perubahan database production, reset, penghapusan
data existing, atau perubahan manual _prisma_migrations.

## Blocker yang ditemukan dan diperbaiki

- File upload memakai filesystem lokal. File baru sekarang memakai Blob privat
  melalui direct client upload; body file tidak melewati Vercel Functions.
- Batas upload 5–50 MB tidak cocok dengan API multipart biasa pada Vercel.
  Client sekarang mengirim file ke Blob dan hanya upload ID ke API resource.
- Upload membutuhkan validasi/ownership setelah direct upload. UploadIntent
  mengikat user, kind, path acak, MIME, ukuran, expiry; metadata dan signature
  diperiksa server. Konsumsi intent atomik dengan resource mencegah reuse/race.
- Download lokal diganti stream privat dengan pengecekan role/ownership atau
  PUBLISHED sebelum akses storage. Range PDF/video didukung, termasuk status 206/416.
- Foto, bukti, dan draft tidak memakai URL Blob publik. Galeri terbit juga
  mendukung Blob privat; aset statis yang memang publik tetap di public/images.
- Reader legacy hanya untuk development lokal tanpa VERCEL; tidak ada penulisan
  lokal baru. Vercel tidak menggunakan reader itu.
- Schema drift SiteContent.updatedAt ditemukan lewat uji database, bukan build.
  Migration tambahan menyamakan default dan menambahkan UploadIntent.
- Fallback kredensial PostgreSQL localhost dihapus. Runtime DATABASE_URL dipisahkan
  dari DIRECT_URL untuk CLI; pooling, timeout, dan reuse client dikonfigurasi.
- Seed umum sebelumnya menimpa CMS dan membuat warga contoh. Diblokir pada
  production/Vercel. Bootstrap admin khusus db:init-admin tidak menjalankan seed
  konten/contoh dan tidak mereset akun existing.
- Seed baru memvalidasi password 12–256 karakter, menolak whitespace kosong/hash
  existing tidak valid, memakai scrypt dengan salt acak, tanpa log credential.
- Node host 25.2.1 tidak sesuai target. Node 24.21.0 digunakan untuk semua pemeriksaan
  akhir, dengan target 24.x pada package.json/.nvmrc dan panduan Vercel.
- Advisory kritis dependency ditemukan. Next.js diperbarui 16.3.1 → 16.3.8;
  CLI/client/adapter Prisma diselaraskan 7.10.0; NextAuth tetap 4.24.15.
  Override patch @auth/core, deepmerge-ts, mysql2, source-map-js diuji.
- Dua error lint lama di check_checksum.js diperbaiki lewat import ESM,
  tanpa menonaktifkan aturan lint.
- vercel.json, build gate env, .env.example yang dapat di-track, dan panduan
  Preview/Production ditambahkan.

## Autentikasi aktual

- Login admin.pinaras pada server localhost yang sudah ada: HTTP credentials
  berhasil, session ADMIN_KELURAHAN valid, redirect /admin, dashboard HTTP 200.
  Password salah ditolak tanpa session. Admin ditolak dari /warga.
- Adapter/session warga Google yang sudah ada: lookup berhasil, persisted SIPP
  user ID tetap, role WARGA, /warga HTTP 200, /admin ditolak, login redirect benar.
- Inisiasi OAuth aktual: host accounts.google.com, callback URI lokal persis,
  response_type=code, client ID sesuai konfigurasi, state, PKCE S256 dan cookie
  pengaman tersedia. Tidak mencetak redirect URL yang berisi client ID/state.
- Proxy tetap aktif. Token malformed fail closed. Google email yang secara
  eksplisit tidak terverifikasi ditolak. Tidak menambah provider/role/login warga
  password atau admin registration.
- Consent dan code/token exchange Google nyata belum diuji, khususnya pada domain
  Preview yang belum dikonfigurasi di Google Cloud.

## Migrasi: bukti aktual dan batasnya

Audit baca-saja database existing:
- User.customImage ada dan didukung migration 20261010000000_add_user_custom_image.
- Seluruh migration aktif/sukses cocok dengan file repository saat pemeriksaan.
- Ada satu percobaan 20261006000000_v2_roles_complaint_content yang belum finished
  tetapi sudah rolled back, dengan checksum lama berbeda; percobaan aktifnya
  sudah berhasil dan cocok. Riwayat tersebut tidak ditulis ulang.
- Tidak ada migration gagal yang masih aktif pada riwayat yang diperiksa.

Database audit kedua benar-benar kosong: initialTableCount=0.
Node 24.21.0 + Prisma 7.10.0:
1. 20260930000000_init — sukses, checksum cocok.
2. 20260930010000_add_internal_note_action — sukses, checksum cocok.
3. 20261001111632_add_evidence_notifications — sukses, checksum cocok.
4. 20261006000000_v2_roles_complaint_content — sukses, checksum cocok.
5. 20261010000000_add_user_custom_image — sukses, checksum cocok.
6. 20261010010000_persistent_upload_intents — sukses, checksum cocok.

Deploy kedua exit 0, tidak menerapkan ulang migration.
Schema diff --exit-code menghasilkan 0 dan script “This is an empty migration.”
User.customImage terverifikasi ada. Semua migration audit finished dan tidak
rolled back. Tidak mengedit kelima SQL migration lama.

Migration tambahan tidak menghapus data: membuat tabel/FK/index UploadIntent dan
menghapus default SiteContent.updatedAt agar sesuai schema @updatedAt.
**Tidak diterapkan pada database aplikasi existing dalam sesi ini.**
Database audit lokal beserta fixture dipertahankan; tidak di-drop/reset.

Batas: migration V2 lama memang menghapus akun/kolom legacy dan pdfPath.
Keberhasilan dari database kosong tidak membuktikan preservasi data upgrade V1.
Backup dan strategi khusus diperlukan sebelum migrasi database legacy berisi data.

## Validasi akhir

Semua perintah runtime berikut memakai Node 24.21.0 melalui npm exec --package=node@24.

- vitest run: **197 tes lulus, 23 file**.
- tsc --noEmit: **lulus**.
- eslint seluruh repository: **lulus**, tanpa error/warning.
- prisma validate: **lulus**.
- Prisma generate 7.10.0: **lulus**.
- next build 16.3.8: **lulus**; /api/uploads dan seluruh route UI/auth/media tersedia.
- scripts/audit-migrations.mjs: **lulus**, DB kosong, deploy ulang dan schema diff
  diperiksa terpisah dari build.
- scripts/preview-integration.mjs: **17 pemeriksaan lulus** pada server production
  lokal port 3001 dengan DB audit. Seed non-overwrite, hash, pembuatan/link account
  Google WARGA, session dan dashboard, role/guest/draft boundaries, password salah,
  serta claim upload SQL konkuren dan rollback resource teruji.
  Server milik QA ditutup setelah pemeriksaan; server pengguna tidak dihentikan.
- scripts/auth-smoke.ts: **lulus** untuk admin existing, baca/login saja.
- scripts/auth-google-session-smoke.ts: **lulus**, memakai warga existing dan JWT
  lokal yang sah; bukan consent Google.
- scripts/google-oauth-init.ts: **8 pemeriksaan inisiasi lulus**, bukan code exchange.
- scripts/migrate-local-files.ts dry-run: **6 referensi lokal, 6 file tersedia,
  0 hilang, 0 tidak valid, 0 update**.
- Build gate environment: tes format lengkap, Blob hilang, URL localhost, dan
  konflik secret aliases lulus. Belum dijalankan terhadap env Vercel milik pengguna.
- npm audit --omit=dev: **0 temuan runtime**.
- npm audit keseluruhan: **5 high pada rantai braces/fast-glob/micromatch/
  plugin/config ESLint**. Tidak ada critical. Versi braces terbaru yang tersedia
  saat pemeriksaan masih 3.0.3 dan termasuk advisory; tidak downgrade framework
  atau memaksa audit fix. Ini toolchain lint, bukan paket runtime deployment.
- git diff --check: **lulus**.
- .env.local dan artefak QA/backup privat tetap gitignored; .env.local tidak diubah.

Perintah utama yang dijalankan:
- npm exec --package=node@24 -- node node_modules/vitest/vitest.mjs run
- npm exec --package=node@24 -- node node_modules/typescript/bin/tsc --noEmit
- npm exec --package=node@24 -- node node_modules/eslint/bin/eslint.js
- npm exec --package=node@24 -- node node_modules/prisma/build/index.js validate
- npm exec --package=node@24 -- node scripts/audit-migrations.mjs
- npm exec --package=node@24 -- node scripts/prepare-pdf-worker.mjs
- npm exec --package=node@24 -- node node_modules/next/dist/bin/next build
- npm exec --package=node@24 -- node --import tsx scripts/preview-integration.mjs
- npm exec --package=node@24 -- node --import tsx scripts/auth-smoke.ts
- npm exec --package=node@24 -- node --import tsx scripts/auth-google-session-smoke.ts
- npm exec --package=node@24 -- node --import tsx scripts/google-oauth-init.ts
- npm exec --package=node@24 -- node --import tsx scripts/migrate-local-files.ts
- npm audit --omit=dev --json; npm audit --json; git diff --check

## File dibuat/diubah

Konfigurasi:
- .gitignore, .env.example, .nvmrc, vercel.json
- package.json, package-lock.json, prisma.config.ts
- check_checksum.js
- src/lib/prisma.ts
- src/lib/auth.ts, src/proxy.ts

Database/bootstrap:
- prisma/schema.prisma
- prisma/migrations/20261010010000_persistent_upload_intents/migration.sql
- prisma/seed-admin.ts, prisma/seed.ts, prisma/initialize-admin.ts

Upload/download:
- src/lib/upload-rules.ts, src/lib/upload-client.ts, src/lib/uploads.ts
- src/lib/blob-storage.ts, src/lib/legacy-local-media.ts
- src/lib/announcement-media.ts, src/lib/complaints.ts
- src/app/api/uploads/route.ts
- src/app/api/profile/photo/route.ts
- src/app/api/warga/pengaduan/route.ts
- src/app/api/pengaduan/[ticketNumber]/evidence/[evidenceId]/route.ts
- src/app/api/admin/pengumuman/route.ts
- src/app/api/galeri/[id]/route.ts
- src/components/profile-photo-form.tsx
- src/components/complaint-form.tsx
- src/components/announcement-manager.tsx

Tes:
- src/lib/uploads.test.ts, src/lib/blob-storage.test.ts, src/lib/deployment-env.test.ts
- src/app/api/uploads/route.test.ts
- src/app/api/pengaduan/evidence-access.test.ts
- src/app/api/profile/photo/route.test.ts (diganti untuk alur persisten)
- src/app/api/profile/photo/local-upload.test.ts (dihapus karena penulisan lokal diganti)
- src/app/api/admin/pengumuman/route.test.ts
- src/lib/auth-config.test.ts, src/lib/seed-admin.test.ts, src/proxy.test.ts

Diagnostik/dokumentasi:
- scripts/create-audit-database.ts, scripts/audit-migrations.mjs
- scripts/check-deployment-env.mjs, scripts/preview-integration.mjs
- scripts/google-oauth-init.ts, scripts/migrate-local-files.ts
- docs/VERCEL_READINESS_AUDIT.md
- docs/VERCEL_DEPLOYMENT.md
- docs/VERCEL_PREVIEW_REPORT.md

## Yang belum diselesaikan dan alasannya

- Env dan koneksi PostgreSQL terkelola Preview/Production: tidak ada akses/target
  layanan tersebut dalam sesi. Uji migration dilakukan pada PostgreSQL lokal nyata,
  bukan emulator/in-memory database.
- Blob roundtrip nyata serta pemindahan enam file legacy: token Blob lokal belum
  tersedia. Script aman default dry-run sudah disiapkan; tidak menebak/meminta
  nilai secret dan tidak melakukan apply.
- Consent/code exchange Google pada Preview: memerlukan domain, Google Cloud
  registration, dan interaksi akun tester. Inisiasi dan adapter/session lulus.
- Deployment Preview belum dijalankan; Production tidak disentuh sesuai instruksi.
- Screenshot/interaksi browser/perangkat belum diuji. HTTP integration bukan
  pengganti pengujian thumbnail, file picker/drop, dan playback nyata.
- Lima advisory toolchain lint belum memiliki patch braces yang sesuai di registry
  saat pemeriksaan. Audit runtime sudah bersih.
- Housekeeping object upload tidak terpakai dan perlindungan abuse/login menyeluruh
  perlu disiapkan sebelum Production. Tidak menambahkan penghapusan massal otomatis.

Environment wajib/opsional dan langkah manual Vercel, Google Cloud, PostgreSQL,
Blob serta migrasi file ada pada docs/VERCEL_DEPLOYMENT.md.

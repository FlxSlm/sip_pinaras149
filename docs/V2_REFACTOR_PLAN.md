# SIPP V2 — Refactor Plan (Final Phase Order)

Urutan refactor final dari SIPP V1 ke V2 dalam repository yang sama (branch `sipp-v2`).
Setiap phase memuat: objective, dependencies, files likely to change/create/deprecate,
risks, tests, acceptance criteria. Prinsip: `AUDIT → REUSE SAFE → REPLACE OBSOLETE →
MIGRATE CAREFULLY → VERIFY`.

Dokumen terkait: `V2_PRODUCT_DECISION_LOG.md`, `V2_DATABASE_DELTA_PLAN.md`,
`V2_PUBLIC_COMPLAINT_SPEC.md`, `DESIGN_IMPLEMENTATION_MAP.md`,
`V2_IMPLEMENTATION_GAP.md`, `V2_TEST_STRATEGY.md`.

---

## PHASE 0 — Git safety + branch

- **Objective:** baseline aman sebelum refactor.
- **Dependencies:** none.
- **Change:** commit checkpoint, `git tag sipp-v1-before-refactor`, `git checkout -b sipp-v2`.
- **Create/deprecate:** none (tidak ada perubahan kode).
- **Risks:** working tree saat ini belum bersih (`.gitignore`, `AGENTS.md`, `README.md`,
  `docs/`, dan file desain baru belum di-commit) — commit terpisah yang disengaja.
- **Tests:** none.
- **Acceptance:** branch `sipp-v2` aktif, tag terpasang, baseline bisa di-restore.

## PHASE 1 — Documentation + design mapping

- **Objective:** source of truth lengkap.
- **Dependencies:** PHASE 0.
- **Create:** `V2_PRODUCT_DECISION_LOG.md`, `V2_DATABASE_DELTA_PLAN.md`,
  `V2_PUBLIC_COMPLAINT_SPEC.md`, `DESIGN_IMPLEMENTATION_MAP.md`,
  `V2_IMPLEMENTATION_GAP.md`, `V2_TEST_STRATEGY.md`, `V2_REFACTOR_PLAN.md`.
- **Deprecate:** `PROJECT_SPEC.md` (V1), `SIPP_V2_NGODINGPAKEAI_START_PROMPT_OLD_OPTIONAL.md`,
  `Konsep.txt`, `AI_PROMPTS.md` → legacy.
- **Acceptance:** keputusan produk terpusat; tidak ada konflik V1/V2 tersisa; design
  mapping terdokumentasi.

## PHASE 2 — Testing foundation

- **Objective:** kerangka tes sebelum fitur.
- **Dependencies:** PHASE 1.
- **Create:** Vitest config + `tests/`, script `test`; Playwright untuk e2e.
- **Change:** `package.json`, `eslint.config.mjs` bila perlu.
- **Risks:** pemilihan framework harus disetujui (install dependency terjadi di fase ini).
- **Tests:** smoke test baseline (status mapping helper).
- **Acceptance:** `npm test` lulus; ada coverage minimum untuk helper core.

## PHASE 3 — Database V2

- **Objective:** skema final V2.
- **Dependencies:** PHASE 1, PHASE 2.
- **Change:** `prisma/schema.prisma` (enum & model), `prisma/seed.ts` (admin seeded,
  tanpa password lemah), `prisma.config.ts`.
- **Create:** migration baru (additif + enum rename via create-new-type), tabel CMS/Media.
- **Deprecate:** kolom `username`, `publicationStatus`, `rating`, `evidencePath`,
  `lingkunganId`, `Announcement.pdfPath`, `published`.
- **Risks:** Postgres enum alter; kolom NOT NULL baru butuh backfill; data loss pada drop.
- **Tests:** unit mapping status/role; seed clean.
- **Acceptance:** `prisma generate` + `migrate` lulus di staging; rollback terdokumentasi.

## PHASE 4 — Authentication & authorization

- **Objective:** 2 role final + credentials admin + ganti password.
- **Dependencies:** PHASE 3.
- **Change:** `src/lib/auth.ts`, `src/lib/authorization.ts`, `src/proxy.ts`,
  `src/types/next-auth.d.ts`, `src/app/login/page.tsx`.
- **Create:** endpoint/UI ganti password admin, profil admin.
- **Deprecate:** `src/lib/username.ts`, `username-form.tsx`, `/api/profile/username`,
  credentials untuk `kepala_lingkungan`/`lurah`.
- **Risks:** kompatibilitas `next-auth@4` + `@auth/prisma-adapter@2`.
- **Tests:** auth + authorization P0 (`V2_TEST_STRATEGY`).
- **Acceptance:** warga hanya Google; admin hanya credentials; username hilang; ganti
  password admin berfungsi.

## PHASE 5 — Public landing page foundation

- **Objective:** landing dinamis + penerapan design system (siluet alam Tomohon).
- **Dependencies:** PHASE 4.
- **Change:** `src/app/page.tsx`, `src/app/globals.css` (unifikasi token), `dashboard-shell.tsx`.
- **Create:** layout hero/background siluet (`panorama-pinaras.png` + gradasi overlay).
- **Deprecate:** konten hard-coded (dipindahkan ke CMS pada PHASE 6).
- **Risks:** konsistensi visual (dua palette lama harus disatukan).
- **Tests:** komponen smoke; responsif.
- **Acceptance:** landing mengikuti `DESAIN LANDING PAGE.png`; konten siap di-CMS-kan.

## PHASE 6 — CMS/content management

- **Objective:** konten dinamis + provenance statistik.
- **Dependencies:** PHASE 3, PHASE 5.
- **Create:** model handler/API `KelurahanContent`, `Statistic`, `Potential`, `Facility`,
  `GalleryMedia` + admin UI, upload helper.
- **Change:** `src/app/page.tsx` konsumsi CMS.
- **Risks:** integritas data resmi (jangan ubah tanpa verifikasi).
- **Tests:** CMS authorization test.
- **Acceptance:** konten dikelola admin tanpa redeploy; provenance tersimpan.

## PHASE 7 — Announcement + media

- **Objective:** announcement TEXT/PDF/VIDEO + status DRAFT/PUBLISHED/ARCHIVED.
- **Dependencies:** PHASE 3, PHASE 4.
- **Change:** `src/app/api/pengumuman/route.ts`, `announcement-form.tsx`,
  `src/app/pengumuman/*`.
- **Create:** upload PDF/video, validasi MIME/size, unpublish/archive.
- **Deprecate:** `pdfPath`/`published`.
- **Risks:** storage & validasi file.
- **Tests:** upload validation test.
- **Acceptance:** hanya PUBLISHED tampil publik; file privat tidak public-by-default.

## PHASE 8 — Complaint core

- **Objective:** alur complaint V2 (status + priority terpisah).
- **Dependencies:** PHASE 3, PHASE 4.
- **Create:** `src/lib/complaint-workflow.ts`.
- **Change:** `src/lib/complaints.ts`, `src/app/api/warga/pengaduan/route.ts` (lokasi).
- **Deprecate:** `neighborhood-workflow.ts`, `lurah-workflow.ts`, endpoint staff lama.
- **Risks:** preservasi `ComplaintLog` historis.
- **Tests:** status transition + priority + ownership (P0).
- **Acceptance:** hanya warga yang buat; awal `MENUNGGU`; priority wajib saat buka pertama;
  transisi divalidasi server-side.

## PHASE 9 — Public complaint forum

- **Objective:** forum publik SELESAI/DITOLAK dengan sanitized DTO.
- **Dependencies:** PHASE 8.
- **Change:** `src/app/pengaduan/*`, `public-complaint-list.tsx`.
- **Create:** `src/lib/complaint-projection.ts` (redaction).
- **Deprecate:** `publication-control.tsx`, `/api/petugas/lurah/publikasi`.
- **Risks:** kebocoran PII.
- **Tests:** public privacy test (P0).
- **Acceptance:** `MENUNGGU`/`DIPROSES` tidak publik; PII tidak bocor; guest bisa baca.

## PHASE 10 — Warga dashboard

- **Objective:** riwayat inbox-like + chart + profil + notifikasi.
- **Dependencies:** PHASE 8, PHASE 9.
- **Change:** `src/app/warga/page.tsx`, `dashboard-shell.tsx`, `complaint-form.tsx`.
- **Create:** chart status, riwayat, detail, profil (foto), halaman notifikasi.
- **Deprecate:** `rating-control.tsx`, `/api/warga/pengaduan/rating`.
- **Tests:** ownership + UI.
- **Acceptance:** history hanya milik warga; profil tanpa ganti password.

## PHASE 11 — Admin dashboard

- **Objective:** dashboard admin + queue + kelola complaint.
- **Dependencies:** PHASE 8, PHASE 10.
- **Change:** `src/app/petugas/*` → `/admin`, `dashboard-shell.tsx`.
- **Create:** queue tindak lanjut/selesai, diagram status+priority, detail+history.
- **Deprecate:** `leaderboard/page.tsx`, `petugas/lingkungan/*`.
- **Tests:** authorization admin.
- **Acceptance:** queue sesuai definisi; priority & status dikelola admin.

## PHASE 12 — Notifications

- **Objective:** notifikasi scoped per recipient + halaman penuh.
- **Dependencies:** PHASE 8, PHASE 11.
- **Change:** `notifications/route.ts`, `notification-bell.tsx`, model generic ref.
- **Create:** `/notifikasi` (mark read, unread, link).
- **Tests:** notification ownership.
- **Acceptance:** scope recipient benar; tidak bypass authorization.

## PHASE 13 — PWA + responsive refinement

- **Objective:** installable + offline + responsive.
- **Dependencies:** PHASE 5.
- **Change:** `manifest.webmanifest`, `sw.js`, `service-worker-register.tsx`, `layout.tsx`.
- **Create:** ikon PNG 192/512, cache versioning.
- **Risks:** private cache leak.
- **Tests:** PWA manifest + offline fallback.
- **Acceptance:** installable; offline fallback; private path tidak di-cache.

## PHASE 14 — Security hardening

- **Objective:** rate limit, headers/CSP, sanitasi.
- **Dependencies:** semua fitur.
- **Change:** `next.config.ts`, `src/app/api/*`, validasi upload, redaction.
- **Tests:** security test cases.
- **Acceptance:** rate limit aktif; validation server-side; secrets env-only.

## PHASE 15 — QA/UAT

- **Objective:** verifikasi menyeluruh.
- **Dependencies:** semua.
- **Change:** none (hanya perbaikan temuan).
- **Tests:** lint, typecheck, build, unit/integration, e2e.
- **Acceptance:** seluruh acceptance criteria terpenuhi.

## PHASE 16 — Production deployment

- **Objective:** rilis.
- **Dependencies:** PHASE 15.
- **Change:** env produksi (OAuth callback, DB, storage, secret), backup, monitoring.
- **Acceptance:** SOP handover; backup terjadwal; monitoring aktif.

---

## Peta File (ringkasan)

| Kategori | Path |
|---|---|
| Modify (auth/role) | `src/lib/auth.ts`, `src/lib/authorization.ts`, `src/proxy.ts`, `src/types/next-auth.d.ts`, `src/app/login/page.tsx` |
| Modify (complaint) | `src/lib/complaints.ts`, `src/app/api/warga/pengaduan/route.ts` |
| Modify (public) | `src/app/pengaduan/*`, `src/components/public-complaint-list.tsx` |
| Modify (CMS/landing) | `src/app/page.tsx`, `src/app/globals.css` |
| Modify (announcement) | `src/app/api/pengumuman/route.ts`, `src/components/announcement-form.tsx`, `src/app/pengumuman/*` |
| Modify (dashboard) | `src/app/warga/page.tsx`, `src/app/petugas/*`, `src/components/dashboard-shell.tsx`, `src/components/complaint-form.tsx` |
| Modify (notification) | `src/app/api/notifications/route.ts`, `src/components/notification-bell.tsx` |
| Modify (PWA) | `public/manifest.webmanifest`, `public/sw.js`, `src/app/layout.tsx` |
| Deprecate (role/workflow) | `src/lib/neighborhood-workflow.ts`, `src/lib/lurah-workflow.ts`, `src/app/petugas/lingkungan/*`, `src/app/api/petugas/lingkungan/*` |
| Deprecate (rating) | `src/components/rating-control.tsx`, `src/app/api/warga/pengaduan/rating/route.ts` |
| Deprecate (publikasi manual) | `src/components/publication-control.tsx`, `src/app/api/petugas/lurah/publikasi/route.ts` |
| Deprecate (username) | `src/lib/username.ts`, `src/components/username-form.tsx`, `src/app/api/profile/username/route.ts` |
| Deprecate (leaderboard) | `src/app/leaderboard/page.tsx` |
| Deprecate (inbox lama) | `src/components/neighborhood-inbox.tsx`, `src/components/lurah-inbox.tsx` |
| Create | `src/lib/complaint-workflow.ts`, `src/lib/complaint-projection.ts`, CMS API/UI, `/notifikasi`, admin endpoint, PWA PNG, tests |

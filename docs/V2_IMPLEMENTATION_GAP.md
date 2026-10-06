# SIPP V2 — Implementation Gap

Perbandingan repository saat ini (SIPP V1) terhadap target SIPP V2 final.
Kategori: **1 READY TO REUSE · 2 NEEDS MODIFICATION · 3 NEEDS REPLACEMENT ·
4 NEW FEATURE · 5 SHOULD BE DEPRECATED · 6 SECURITY HARDENING · 7 TESTING GAP**.

---

## 1. READY TO REUSE (aman dipertahankan)

| Area | Item |
|---|---|
| DB | `TicketSequence` (generator tiket `LPR-YYYYMM-###`), `Account`/`Session`/`VerificationToken` (adapter), `ComplaintEvidence`, relasi ownership `reporterUserId` |
| Complaint | pola upload evidence (MIME + signature + size + UUID + rollback), endpoint evidence terautorisasi, `ticketNumber` unik |
| Public privacy | pola public `select` tersanitasi (`/pengaduan`, `[ticketNumber]`) — dijadikan dasar sanitized DTO |
| Auth | `prisma.ts` singleton, adapter Google OAuth (tanpa logika username), `AUTH_SECRET` env |
| PWA | `manifest.webmanifest`, `sw.js` (skip private path), `/offline`, `ServiceWorkerRegister` |
| UI | `notification-bell.tsx`, `text-prompt-dialog.tsx`, `logout-button.tsx`, token warna `globals.css` |
| Docs | `docs/*` V2 + decision log sebagai source of truth |

## 2. NEEDS MODIFICATION (dipertahankan, disesuaikan)

| Area | Item |
|---|---|
| DB | `User` (hapus `username`/`phone`/`lingkunganId`), `Complaint` (status enum, +priority/+location/+timestamps, −rating/−publication), `ComplaintLog` (+priority), `Announcement` (status+mediaType+mediaRef), `Notification` (generic ref) |
| Auth | `src/lib/auth.ts` (hapus credentials 2 role staff → `ADMIN_KELURAHAN`), `authorization.ts` (2 role), `proxy.ts`, `next-auth.d.ts`, `login/page.tsx` |
| Complaint | `complaints.ts` (tanpa username/lingkungan), `warga/pengaduan/route.ts` |
| Public | `pengaduan/*`, `public-complaint-list.tsx` → status-based + projection |
| Dashboard | `warga/page.tsx`, `petugas/*` → `/admin`, `dashboard-shell.tsx`, `complaint-form.tsx` |
| Announcement | `pengumuman/route.ts`, `announcement-form.tsx`, `pengumuman/*` |
| Notification | `notifications/route.ts`, `notification-bell.tsx` |
| PWA | ikon PNG 192/512, cache versioning |

## 3. NEEDS REPLACEMENT (ditulis ulang)

| Area | Item |
|---|---|
| Workflow | `neighborhood-workflow.ts`, `lurah-workflow.ts` → `complaint-workflow.ts` (status/priority admin) |
| UI inbox | `neighborhood-inbox.tsx`, `lurah-inbox.tsx` → admin queue |
| Announcement UI | `announcement-form.tsx` → editor DRAFT/PUBLISHED/ARCHIVED + TEXT/PDF/VIDEO |
| Landing | `page.tsx` hard-coded → CMS-driven |

## 4. NEW FEATURE (belum ada sama sekali)

| Area | Item |
|---|---|
| Role | `ADMIN_KELURAHAN` (seed + credentials + ganti password) |
| Complaint | priority (`NORMAL`/`PERLU_PERHATIAN`), lokasi, queue admin, diagram status/priority |
| Public forum | forum publik SELESAI/DITOLAK dengan sanitized DTO + redaction |
| CMS | `KelurahanContent`, `Statistic` (provenance), `Potential`, `Facility`, `GalleryMedia` + admin UI |
| Announcement | upload PDF/video, status DRAFT/PUBLISHED/ARCHIVED, unpublish/archive |
| Dashboard warga | chart, riwayat inbox-like, profil foto, halaman notifikasi penuh |
| Media | helper upload galeri/PDF/video, validasi, storage key |
| Test | suite unit/integration/e2e (lihat `V2_TEST_STRATEGY.md`) |

## 5. SHOULD BE DEPRECATED (obsolete, tidak langsung dihapus)

| Item | Alasan |
|---|---|
| `kepala_lingkungan`, `lurah` (role & route `petugas/*`) | role final hanya 2 |
| `neighborhood-workflow.ts`, `lurah-workflow.ts` | workflow lama obsolete |
| `rating-control.tsx`, `/api/warga/pengaduan/rating` | rating dihapus |
| `publication-control.tsx`, `/api/petugas/lurah/publikasi` | publikasi manual → status-based |
| `username.ts`, `username-form.tsx`, `/api/profile/username` | username dihapus |
| `leaderboard/page.tsx` | leaderboard dihapus |
| `Complaint.evidencePath`, `Announcement.pdfPath` | field redundan/mati |
| `publicationStatus`, `publishedAt`, `rating`, `ratedAt` | kolom legacy |
| `PROJECT_SPEC.md` (V1) | digantikan `docs/*` V2 |

## 6. SECURITY HARDENING

| Item | Status |
|---|---|
| Rate limiting (auth/complaint/upload) | belum ada → tambah |
| Security headers/CSP (`next.config.ts`) | belum ada → tambah |
| Password seed lemah (`lurah123`/`kepala123`) | ganti ke hash kuat/seeded env |
| Sanitasi/redaction PII pada public DTO | belum ada → tambah |
| Upload validation (image) | sudah ada; perlu extend PDF/video |
| Authorization server-side | sudah baik; perlu align ke 2 role |
| `next-auth@4` + `@auth/prisma-adapter@2` | konfirmasi/upgrade |
| PWA cache pribadi | sudah skip prefix; verifikasi path baru |

## 7. TESTING GAP

| Item | Status |
|---|---|
| Test framework (unit/integration/e2e) | **tidak ada** |
| Authorization & ownership test | tidak ada |
| Status transition & priority test | tidak ada |
| Public privacy test | tidak ada |
| Upload validation test | tidak ada |
| Notification ownership test | tidak ada |
| CMS authorization test | tidak ada |

---

## Gap terbesar (prioritas)

1. **Model role & workflow** — 3 role + workflow lama → 2 role + alur admin langsung.
2. **Public forum + sanitized DTO** — fitur baru krusial untuk privasi.
3. **CMS + landing dinamis** — menggantikan seluruh konten hard-coded.
4. **Test suite nol** — tanpa ini tidak ada verifikasi authorization/ownership/privacy.
5. **Konsistensi design system** — dua palette bertabrakan (landing vs dashboard) dan
   belum mengikuti 5 file `DESAIN...`.

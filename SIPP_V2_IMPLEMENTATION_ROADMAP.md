# SIPP V2 — Implementation Roadmap

## 0. Bekukan keputusan produk
Role: WARGA, ADMIN_KELURAHAN. Guest bukan role. Warga Google OAuth. Admin credentials seeded. Status/priority terpisah. Landing page dynamic CMS. Announcement text/PDF/video.

## 1. Audit repository lama — READ ONLY
Kilo Code membaca repository, docs, database schema, auth, routing, UI, PWA, upload, tests. Tidak mengubah kode. Output reusable/obsolete/risk/migration/missing.

## 2. Jadikan docs sebagai source of truth
Gunakan `docs/*` pada paket ini. Dokumen V1 yang bertentangan hanya menjadi referensi lama.

## 3. Git safety
Checkpoint commit, tag V1, branch `sipp-v2`.

## 4. Database
Audit schema lama -> delta -> migration/reset plan -> implementasi aman.

## 5. Authentication & authorization
Google OAuth warga; credentials admin; seeded admin; server-side authorization.

## 6. Public landing + CMS
Hero, profil, statistik, potensi, fasilitas, pengumuman, galeri, peta, kontak; content dinamis.

## 7. Announcement + media
Text/PDF/video; validate; storage; publish/unpublish.

## 8. Complaint core
MENUNGGU -> DIPROSES/SELESAI/DITOLAK; priority required on first open; logs; ownership.

## 9. Warga dashboard
Inbox-like history, detail, profile, notification, chart.

## 10. Admin dashboard
Queues, stats, notification, announcement, CMS, profile.

## 11. QA/security
Auth boundaries, ownership, privacy, uploads, validation, secrets, PWA cache.

## 12. PWA/deployment
Manifest, offline fallback, responsive UX, production env, backups, OAuth callback, monitoring.

Gate: phase complete only after verification and reported findings.

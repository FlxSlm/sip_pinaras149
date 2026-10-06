# SIPP V2 — Test Strategy

Repository saat ini **tidak memiliki test suite**. Strategi ini menetapkan lapisan
tes dan prioritas; tes **security-critical** didahulukan.

## Stack (rekomendasi)

- **Unit + integration:** Vitest (+ Testing Library untuk komponen bila perlu).
- **E2E:** Playwright (sudah tersedia sebagai dependency transitif; formalisasi).
- **Script:** `test`, `test:unit`, `test:integration`, `test:e2e` di `package.json`.

## Prioritas

P0 (wajib sebelum fitur lanjut): authorization, ownership, privacy, status transition.
P1: validation, upload, notification ownership, CMS authorization.
P2: UI/component, PWA, E2E happy-path.

---

## 1. Unit Testing

| Target | Kasus |
|---|---|
| Status mapping | V1 status → V2 status (`DIAJUKAN→MENUNGGU`, dst.) |
| Priority | enum & pemisahan dari status |
| `complaint-workflow` | setiap transisi valid & invalid |
| Ticket generator | format `LPR-YYYYMM-###`, unik, parallel-safe |
| Redaction | menghapus email/telepon/nama dari teks |
| Slug / validation | announcement, zod schema |

## 2. Integration Testing

| Target | Kasus |
|---|---|
| Complaint create | input valid → `MENUNGGU`; input invalid → 400 |
| Complaint workflow | buka pertama wajib set priority; transisi tersimpan di log |
| Notification | trigger dibuat dengan recipient benar |

## 3. Authorization Testing (P0)

| Kasus | Ekspektasi |
|---|---|
| guest akses `/warga` | redirect 401/redirect login |
| guest akses `/admin` | redirect login |
| warga akses `/admin` | 403 |
| warga akses complaint warga lain | 403/404 |
| admin akses seluruh complaint | boleh |
| admin akses CMS/announcement | boleh |

## 4. Complaint Ownership Testing (P0)

| Kasus | Ekspektasi |
|---|---|
| warga baca detail milik sendiri | 200 |
| warga baca detail warga lain (private) | 403/404 |
| warga ubah status | 403 (hanya admin) |
| admin ubah status complaint apa pun | 200 |

## 5. Status Transition Testing (P0)

| Dari | Ke | Hasil |
|---|---|---|
| `MENUNGGU` | `DIPROSES`/`SELESAI`/`DITOLAK` | valid |
| `DIPROSES` | `SELESAI` | valid |
| `DIPROSES` | `DITOLAK` | invalid |
| `SELESAI`/`DITOLAK` | `*` | invalid |
| buka `MENUNGGU` tanpa priority | ditolak |

## 6. Public Privacy Testing (P0)

| Kasus | Ekspektasi |
|---|---|
| `MENUNGGU`/`DIPROSES` di public list | tidak muncul |
| `SELESAI`/`DITOLAK` di public list | muncul (projection) |
| public DTO tanpa PII | tidak ada email/telepon/nama/reporterUserId |
| public DTO tanpa private path | tidak ada evidencePath/storageKey/internalNote |
| evidence publik | tidak dapat diakses |

## 7. Authentication Testing

| Kasus | Ekspektasi |
|---|---|
| Google OAuth warga | login → session `WARGA` |
| credentials admin | login → session `ADMIN_KELURAHAN` |
| self-registration admin | tidak ada |
| ganti password admin | berfungsi; warga tidak punya fitur ini |

## 8. Upload Validation Testing

| Kasus | Ekspektasi |
|---|---|
| gambar valid (jpg/png/webp ≤5MB) | diterima |
| tipe salah / >size / signature palsu | ditolak |
| PDF announcement valid | diterima |
| video valid (sesuai storage policy) | diterima |
| filename tepercaya / path traversal | ditolak |

## 9. Notification Ownership Testing

| Kasus | Ekspektasi |
|---|---|
| user hanya lihat notif milik sendiri | `recipientId` scoped |
| mark read milik sendiri | berhasil |
| mark read milik orang lain | ditolak/tidak berpengaruh |

## 10. CMS Authorization Testing

| Kasus | Ekspektasi |
|---|---|
| admin create/edit content | boleh |
| warga/guest edit CMS | 403 |
| content published tampil publik | ya |
| content draft tidak tampil publik | ya |

## 11. E2E Testing (bila diperlukan)

| Alur |
|---|
| warga login Google → buat complaint → lihat di riwayat |
| admin buka complaint → set priority → respon → selesaikan → muncul di forum publik |
| guest baca forum publik (tanpa login) |
| admin publish announcement → muncul di landing |

## Kriteria selesai (per modul)

- authorization benar; validation benar; UI mobile OK; error state ada; constraint DB
  relevan ada; test/verification dijalankan; build produksi lulus; terdokumentasi;
  tidak merusak modul sebelumnya (sesuai `ACCEPTANCE_CRITERIA`/`PROJECT_SPEC` §25).

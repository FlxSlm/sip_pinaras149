# SIPP V2 — Database Delta Plan

Dokumen ini memetakan skema database SIPP V1 (Prisma/PostgreSQL) ke target SIPP V2.
**Bersifat rencana** — tidak ada migration yang dieksekusi pada tahap ini.

Sumber audit: `prisma/schema.prisma` dan `prisma/migrations/*` (3 migration V1).

---

## 1. Ringkasan Kondisi V1

### Enum V1
| Enum | Nilai |
|---|---|
| `UserRole` | `warga`, `kepala_lingkungan`, `lurah` |
| `HandlingStatus` | `DIAJUKAN`, `DIVERIFIKASI`, `DITERUSKAN_KE_LURAH`, `DALAM_PROSES`, `SELESAI`, `DI_LUAR_KEWENANGAN` |
| `PublicationStatus` | `DRAFT`, `PUBLISHED` |
| `ComplaintAction` | `CREATED`, `VERIFIED`, `FORWARDED_TO_LURAH`, `INTERNAL_NOTE_ADDED`, `STATUS_CHANGED`, `RESPONSE_ADDED`, `PUBLISHED`, `UNPUBLISHED`, `RATED` |
| `NotificationType` | `COMPLAINT_RECEIVED`, `COMPLAINT_UPDATED`, `ANNOUNCEMENT_PUBLISHED` |

### Model V1
`User`, `Lingkungan`, `Complaint`, `ComplaintEvidence`, `ComplaintLog`,
`Announcement`, `Notification`, `Account`, `Session`, `VerificationToken`,
`TicketSequence`.

---

## 2. Enum Target V2

| Enum | Nilai target | Perubahan |
|---|---|---|
| `UserRole` | `WARGA`, `ADMIN_KELURAHAN` | rename nilai; hapus 2 nilai |
| `HandlingStatus` → `ComplaintStatus` | `MENUNGGU`, `DIPROSES`, `SELESAI`, `DITOLAK` | rename + kurangi |
| `ComplaintPriority` (baru) | `NORMAL`, `PERLU_PERHATIAN` | baru |
| `AnnouncementMediaType` (baru) | `TEXT`, `PDF`, `VIDEO` | baru |
| `AnnouncementStatus` (baru) | `DRAFT`, `PUBLISHED`, `ARCHIVED` | baru |
| `PublicationStatus` | **dihapus** | digantikan visibility status-based |
| `ComplaintAction` | `CREATED`, `OPENED`, `STATUS_CHANGED`, `PRIORITY_CHANGED`, `NOTE_ADDED`, `RESPONSE_ADDED` (hapus `VERIFIED`, `FORWARDED_TO_LURAH`, `INTERNAL_NOTE_ADDED`, `PUBLISHED`, `UNPUBLISHED`, `RATED`) | ganti set nilai |
| `NotificationType` | `COMPLAINT_CREATED`, `COMPLAINT_STATUS_CHANGED`, `COMPLAINT_RESPONSE`, `COMPLAINT_PRIORITY`, `ANNOUNCEMENT_PUBLISHED` (perluasan) | ganti/expand |

---

## 3. Tabel per Model: Pertahankan / Ubah / Baru / Obsolete

### 3.1 `User` — UBAH
| Aspek | V1 | V2 |
|---|---|---|
| `username` (unique NOT NULL) | ada | **hapus** (warga tanpa username) |
| `role` | `UserRole` 3 nilai | `UserRole` 2 nilai |
| `lingkunganId` | ada (FK) | **hapus** (admin tidak environment-scoped) |
| `phone` | ada | **evaluasi** — bukan bagian User V2; rekomendasi: hapus, ganti `profile_image_url` bila perlu |
| `passwordHash` | ada | tetap (admin), `null` untuk warga |
| `image` | ada | tetap (`profile_image_url`/avatar) |
| relasi `lingkungan` | ada | hapus |

Catatan: `Account`/`Session`/`VerificationToken` tetap (adapter Auth.js).
Rekomendasi teknis terpisah: verifikasi kompatibilitas `next-auth@4` dengan
`@auth/prisma-adapter@2` (lihat Refactor Plan).

### 3.2 `Lingkungan` — UBAH PERAN (bukan routing complaint)
| Aspek | Keputusan |
|---|---|
| Peran | bukan lagi routing complaint; dijadikan master data (CMS) atau dipensiunkan |
| Rekomendasi | pertahankan sebagai master SLS (8) untuk data statistik/geografis; lepas relasi `Complaint.lingkunganId` dan `User.lingkunganId` |
| `name` placeholder `Lingkungan 01..08` | tidak boleh dipublikasikan sampai nama resmi diverifikasi |

### 3.3 `Complaint` — UBAH BESAR
| Field | Status |
|---|---|
| `ticketNumber` (unique) | pertahankan |
| `reporterUserId` | pertahankan (FK ke User) |
| `category` | pertahankan (string; evaluasi enum terpisah) |
| `title`, `description` | pertahankan |
| `location` (baru) | tambah (menggantikan `lingkunganId`) |
| `handlingStatus` → `status` | ganti enum ke `ComplaintStatus` |
| `priority` (baru) | tambah, nullable (wajib diisi saat buka pertama) |
| `internalNote` | pertahankan (note internal admin) |
| `officialResponse` | pertahankan (tanggapan publik yang aman) |
| `respondedAt` | pertahankan |
| `openedAt` (baru) | tambah (saat pertama dibuka) |
| `completedAt` (baru) | tambah |
| `rejectedAt` (baru) | tambah |
| `rating`, `ratedAt` | **obsolete** (archive/delete di dokumentasi terpisah) |
| `publicationStatus`, `publishedAt` | **hapus** — diganti visibility status-based |
| `evidencePath` | **hapus** — diganti `ComplaintEvidence` (konsolidasi) |
| `lingkunganId` | **hapus** — diganti `location` |

### 3.4 `ComplaintEvidence` — PERTAHANKAN (konsolidasi)
| Aspek | Keputusan |
|---|---|
| `path`, `mimeType`, `sizeBytes` | pertahankan |
| Tambah `storage_key` unik non-guessable | ya (sudah UUID di V1) |
| Akses | privat via API terautorisasi (pola V1 dipertahankan) |

### 3.5 `ComplaintLog` — UBAH
| Field | Status |
|---|---|
| `complaintId`, `actorUserId`, `note`, `createdAt` | pertahankan |
| `fromStatus`/`toStatus` → `oldStatus`/`newStatus` | rename + enum baru |
| `oldPriority`/`newPriority` (baru) | tambah |
| `action` | ganti set nilai enum |
| Aturan | tidak boleh diedit lewat UI; tidak boleh dihapus yang dibutuhkan audit |

### 3.6 `Announcement` — UBAH BESAR
| Field | Status |
|---|---|
| `title`, `slug`, `content`, `isPinned`, `createdById`, timestamps | pertahankan |
| `mediaType` (baru) | `TEXT`/`PDF`/`VIDEO` |
| `mediaRef`/`storageKey` (baru) | menggantikan `pdfPath` |
| `status` (baru) | `DRAFT`/`PUBLISHED`/`ARCHIVED` |
| `publishedAt` (baru) | tambah |
| `published` (boolean) | **hapus** (diganti status enum) |
| `pdfPath` | **hapus** (field mati, diganti mediaRef) |

### 3.7 `Notification` — UBAH (polymorphic ref)
| Field | Status |
|---|---|
| `recipientId`, `type`, `title`, `message`, `readAt`, `createdAt` | pertahankan |
| `relatedEntityType`/`relatedEntityId` (baru) | tambah (menggantikan `complaintId`/`announcementId` eksplisit) |
| `complaintId`/`announcementId` FK | hapus/ganti ke generic ref |

### 3.8 Model BARU (CMS)
| Model | Field utama |
|---|---|
| `KelurahanContent` | `key`/`section`, `value`, `updatedBy`, timestamps (hero, profil, sejarah, visi-misi, kontak, peta, section config) |
| `Statistic` | `label`, `value`, `unit`, `source`, `sourceTable`, `sourceYear`, `sourcePage`, `verifiedAt`, `published`, `sortOrder` |
| `Potential` | `title`, `description`, `imageRef`, `sortOrder`, `published`, `sourceNote` |
| `Facility` | `name`, `type`, `description`, `address?`, `imageRef?`, `published`, `sourceNote` |
| `GalleryMedia` / `Media` | `storageKey`, `mimeType`, `sizeBytes`, `caption`, `credit`, `category`, `sortOrder`, `published`, `uploadedBy`, `createdAt` |

---

## 4. Public Complaint Projection (desain)

```
database Complaint (private)
        │
        ▼  (server-side mapping + redaction)
sanitized public DTO / projection
        │
        ▼
public forum (guest/warga/admin)
```

- **Tidak ada** objek Complaint mentah yang dikembalikan ke public API.
- Public projection diturunkan hanya untuk `status IN (SELESAI, DITOLAK)`.
- DTO publik berisi: `ticketNumber`, `category`, `title`, `description` (tersanitasi),
  `status`, `priority` (bila diputuskan tampil), `createdAt`, `completedAt`/`rejectedAt`,
  `officialResponse` (tersanitasi).
- DTO publik **tidak pernah** berisi: `reporterUserId`, nama/email/telepon, `internalNote`,
  `evidencePath`/`storageKey`, log audit, session, field privat lain.
- Redaksi diterapkan pada `description` dan `officialResponse` bila mengandung pola PII
  (email, telepon, nama) sebelum render.

---

## 5. Migration Mapping (rencana, belum dieksekusi)

### 5.1 Role
| Lama | Baru |
|---|---|
| `warga` | `WARGA` |
| `kepala_lingkungan` | `ADMIN_KELURAHAN` |
| `lurah` | `ADMIN_KELURAHAN` |

- Akun staff lama (`lurah.pinaras`, `kepala.*`) tetap jadi `ADMIN_KELURAHAN` atau
  diganti dengan akun admin baru yang di-seed. Putuskan: pertahankan akun lama vs seed baru.
- `lingkunganId` pada `User` di-null lalu kolom dihapus.

### 5.2 Status
| Lama | Baru |
|---|---|
| `DIAJUKAN` | `MENUNGGU` |
| `DIVERIFIKASI` | `MENUNGGU` |
| `DITERUSKAN_KE_LURAH` | `MENUNGGU` |
| `DALAM_PROSES` | `DIPROSES` |
| `SELESAI` | `SELESAI` |
| `DI_LUAR_KEWENANGAN` | `DITOLAK` |

- Audit `ComplaintLog` agar riwayat transisi lama tidak hilang: mapping `fromStatus`/`toStatus`
  lama tetap bisa dibaca, atau simpan nilai lama di kolom teks cadangan sebelum enum diganti.

### 5.3 Priority (backfill)
- Baris lama tidak punya priority. Strategi: biarkan `NULL` (legacy) sampai admin membuka
  ulang; **jangan** backfill massal dengan nilai asumsi. Baris `SELESAI`/`DITOLAK` lama
  bisa di-set `NORMAL` sebagai default historis, didokumentasikan.

### 5.4 Rating (legacy)
- Opsi A (rekomendasi): pertahankan data, tandai kolom deprecated, arsipkan ke tabel
  `_legacy_rating` sebelum drop kolom.
- Opsi B: export CSV lalu drop. Keputusan eksekusi ditunda (non-destruktif), lihat Refactor Plan.

### 5.5 Username
- `username` dibuat nullable → drop. Warga diidentifikasi via `Account.providerAccountId`.
- Tidak ada data yang perlu dipetakan (username bukan identitas otorisasi).

---

## 6. Migration Risks

1. **Postgres enum alteration**: mengubah/hapus nilai enum (`UserRole`, `HandlingStatus`,
   `PublicationStatus`) tidak bisa `ALTER TYPE ... DROP VALUE` langsung bila nilai dipakai;
   butuh pola create-new-type → migrate → rename → drop-old.
2. **NOT NULL baru** (`priority`, `openedAt`, dst.) pada baris existing → butuh default/backfill.
3. **Penghapusan kolom** (`username`, `publicationStatus`, `rating`, `evidencePath`,
   `lingkunganId`) → potensi data loss; harus archive/export dulu.
4. **Relasi `Lingkungan`** dihapus dari Complaint → kehilangan scope historis; simpan
   `location` teks sebagai pengganti, audit sebelum drop.
5. **`ComplaintLog` enum action** berubah → riwayat lama harus tetap terbaca.
6. **Notification polymorphic ref** (`complaintId`/`announcementId` → generic) → migrasi FK
   dan integritas relasi.
7. **`Announcement.published` boolean → status enum** → mapping `true→PUBLISHED`,
   `false→DRAFT` (V1 tidak punya archive).
8. **Adapter Auth.js** (`next-auth@4` + `@auth/prisma-adapter@2`) — konfirmasi kompatibilitas
   tabel `Account`/`Session`/`VerificationToken` saat upgrade.

## 7. Rollback Strategy

- Setiap migration dibuat **reversibel** (down migration) untuk perubahan additif.
- Untuk enum/rename/delete: backup tabel via `CREATE TABLE ... AS SELECT` atau dump
  sebelum eksekusi; siapkan script restore.
- Jalankan migration dalam transaksi bila dimungkinkan; uji pada staging sebelum produksi.
- Pertahankan checkpoint Git + tag `sipp-v1-before-refactor` sebelum migration pertama.

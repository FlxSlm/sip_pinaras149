# SIPP V2 — Public Complaint Specification

Spesifikasi forum pengaduan publik. Prinsip inti:

> **Complaint creation = authenticated WARGA**
> **Private complaint = WARGA owner + ADMIN_KELURAHAN**
> **Public complaint = `SELESAI` atau `DITOLAK` only**
> **Public viewer = everyone (guest/warga/admin)**

---

## 1. Siapa yang boleh membuat complaint

- Hanya `WARGA` yang sudah login Google OAuth.
- `PUBLIC/GUEST` **tidak** dapat membuat complaint.
- `ADMIN_KELURAHAN` tidak membuat complaint sebagai warga.

## 2. Siapa yang boleh membaca private complaint

| Role | Akses private complaint |
|---|---|
| WARGA | hanya complaint miliknya sendiri (`reporterUserId = currentUser.id`) |
| ADMIN_KELURAHAN | seluruh complaint dalam scope Kelurahan Pinaras |
| PUBLIC/GUEST | tidak boleh (hanya public projection) |

## 3. Kapan complaint menjadi public

- Complaint menjadi tersedia di forum publik **hanya** ketika `status` bernilai
  `SELESAI` atau `DITOLAK`.
- `MENUNGGU` dan `DIPROSES` **tidak pernah** tampil di forum publik.
- Tidak ada tombol/toggle publikasi manual per complaint (model V1 `DRAFT/PUBLISHED`
  dihapus). Visibilitas publik diturunkan dari status final.

## 4. Field yang ditampilkan publik

- `ticketNumber`
- `category`
- `title`
- `description` (catatan/deskripsi pengadu) — **tersanitasi**
- `status`
- `priority` — ditampilkan bila tersedia (policy default: tampilkan)
- `createdAt` (tanggal pengaduan)
- `completedAt` / `rejectedAt` (tanggal selesai/ditolak, bila ada)
- `officialResponse` (tanggapan admin) — **tersanitasi**

## 5. Field yang disembunyikan dari publik

- nama lengkap pelapor
- email pelapor
- nomor telepon
- OAuth / provider ID
- alamat pribadi
- internal audit log (`ComplaintLog`)
- private evidence path / storage key
- session information
- `internalNote`
- `reporterUserId`
- data internal lainnya

## 6. Public DTO / Projection

```ts
type PublicComplaint = {
  ticketNumber: string;
  category: string;
  title: string;
  description: string;        // redacted
  status: "SELESAI" | "DITOLAK";
  priority: "NORMAL" | "PERLU_PERHATIAN" | null;
  createdAt: string;
  completedAt: string | null;
  rejectedAt: string | null;
  officialResponse: string | null; // redacted
};
```

Aturan:
- Server **tidak boleh** mengembalikan objek `Complaint` database mentah ke public API.
- Mapping dilakukan server-side ke DTO di atas.
- Redaksi diterapkan pada `description` dan `officialResponse` (lihat §7).

## 7. Sanitization / Redaction

- `description` dan `officialResponse` harus melewati fungsi redaction sebelum dipublikasikan.
- Redaction setidaknya menghapus/mengganti pola PII: alamat email, nomor telepon
  (termasuk format Indonesia), dan bila dimungkinkan nama pribadi yang terdeteksi.
- Jangan render HTML mentah; render sebagai teks aman (escaping/`whitespace-pre-wrap`).
- Bila redaction tidak bisa menjamin aman (teks ambigu), kebijakan fallback: tampilkan
  ringkasan generik atau sembunyikan field daripada membocorkan PII.

## 8. Routing

| Path | Isi |
|---|---|
| `/pengaduan` | daftar public complaint (`SELESAI`/`DITOLAK`), filter kategori/status |
| `/pengaduan/[ticketNumber]` | detail public (hanya bila `SELESAI`/`DITOLAK`; selain itu `404`) |
| `/warga/pengaduan/[ticketNumber]` | detail privat milik warga (wajib login + owner) |
| `/admin/pengaduan/[ticketNumber]` | detail internal (wajib ADMIN_KELURAHAN) |

## 9. Pagination / Filtering

- Public list mendukung filter `status` (SELESAI/DITOLAK) dan `category`.
- Pagination server-side (cursor/offset) untuk skala; batas halaman default.
- Urutan default: `createdAt` atau `completedAt/rejectedAt` menurun.

## 10. Privacy Rules

- Data pribadi tidak pernah dipublikasikan otomatis.
- Public API mengembalikan `PublicComplaint[]` / `PublicComplaint`, bukan `Complaint`.
- Evidence/bukti foto **tidak pernah** tampil publik.
- Tanggapan admin hanya dipublikasikan bila sudah ditujukan untuk publik (tidak memuat PII).

## 11. Status Requirement

- Status final publik: `SELESAI`, `DITOLAK`.
- Transisi menuju status final mengikuti aturan complaint core (Decision Log §7).

## 12. Security Rules

- Authorization server-side untuk endpoint privat (owner check / admin check).
- Guest tidak dapat memanggil API privat.
- Public endpoint hanya mengembalikan projection; query dibatasi `status IN (SELESAI, DITOLAK)`.
- Rate limiting pada pembacaan public (opsional) dan pada complaint creation (wajib).
- PWA tidak meng-cache public complaint response yang mengandung data privat (projection
  sudah sanitized, tetap ikuti cache policy).

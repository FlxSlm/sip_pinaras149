# SIPP V2 — Product Decision Log (FINAL)

Dokumen ini merekam seluruh keputusan produk SIPP V2 yang bersifat **final**.
Item yang tercantum di sini tidak boleh lagi dianggap sebagai "decision required".
Dokumen lain (`docs/*`) yang bertentangan dengan dokumen ini diperlakukan sebagai
referensi lama; dokumen ini adalah source of truth keputusan produk.

> Catatan: keputusan berikut **menggantikan** ketentuan lama yang masih tertulis di
> `PROJECT_SPEC.md` (V1 v3.0) dan sebagian asumsi di `docs/DATABASE_DESIGN.md` /
> `docs/PROJECT_REQUIREMENTS.md` (terutama publikasi complaint yang sebelumnya
> bersifat manual/opsional).

---

## 1. Role

| Keputusan | Nilai | Status |
|---|---|---|
| Role database | `WARGA`, `ADMIN_KELURAHAN` (tepat dua) | FINAL |
| Public/Guest | bukan role database; kondisi tanpa autentikasi | FINAL |
| `kepala_lingkungan` | dihapus | FINAL |
| `lurah` (role terpisah) | dihapus | FINAL |
| Penambahan role baru | dilarang tanpa keputusan produk eksplisit | FINAL |

## 2. Authentication

| Keputusan | Nilai | Status |
|---|---|---|
| WARGA login | Google OAuth only | FINAL |
| WARGA Facebook OAuth | tidak ada | FINAL |
| WARGA registrasi username/password | tidak ada | FINAL |
| WARGA password SIPP | tidak ada | FINAL |
| WARGA ganti password SIPP | tidak ada | FINAL |
| ADMIN_KELURAHAN login | credentials aplikasi | FINAL |
| ADMIN Google OAuth | tidak ada | FINAL |
| ADMIN self-registration | tidak ada (di-seed developer) | FINAL |
| ADMIN ganti password | boleh | FINAL |
| Role authorization | server-side; Google email/nama/provider ID bukan dasar otorisasi | FINAL |

## 3. Username Warga

| Keputusan | Nilai | Status |
|---|---|---|
| Username warga | **dihapus** | FINAL |
| Username wajib/unik | tidak ada | FINAL |
| Username generator | tidak ada | FINAL |
| Username editing | tidak ada | FINAL |
| Username-based identity | tidak ada | FINAL |

Identitas warga dikelola melalui account identity provider (Auth.js) dan data profil
yang memang diperlukan aplikasi.

## 4. Rating

| Keputusan | Nilai | Status |
|---|---|---|
| Rating pengaduan | **dihapus** | FINAL |
| rating 1–5 / control / ratedAt / API / statistik | dihapus | FINAL |
| Data rating lama | dipetakan ke rencana archive/delete (lihat Database Delta Plan); tidak ada keputusan destruktif tanpa dokumentasi | FINAL |

## 5. Leaderboard

| Keputusan | Nilai | Status |
|---|---|---|
| Leaderboard (semua bentuk) | **dihapus** | FINAL |
| Ranking performa | tidak ada | FINAL |
| Halaman leaderboard | dihapus (kode lama boleh jadi legacy sementara) | FINAL |

## 6. Complaint Creation

| Keputusan | Nilai | Status |
|---|---|---|
| Pembuat complaint | hanya WARGA yang login Google | FINAL |
| Guest membuat complaint | tidak boleh | FINAL |
| Status awal | `MENUNGGU` | FINAL |
| Alur | Warga → Login Google → Buat → `MENUNGGU` | FINAL |

## 7. Complaint Status

| Keputusan | Nilai | Status |
|---|---|---|
| Nilai status | `MENUNGGU`, `DIPROSES`, `SELESAI`, `DITOLAK` | FINAL |
| MENUNGGU | dibuat, belum dibuka/di-respons admin | FINAL |
| DIPROSES | sedang ditangani admin | FINAL |
| SELESAI | selesai ditangani | FINAL |
| DITOLAK | ditolak admin | FINAL |
| Transisi | `MENUNGGU→DIPROSES`, `MENUNGGU→SELESAI`, `MENUNGGU→DITOLAK`, `DIPROSES→SELESAI` | FINAL |
| Workflow lama (Warga→Kepala Lingkungan→Lurah) | **obsolete** | FINAL |
| Transisi lain | dilarang tanpa keputusan produk | FINAL |

## 8. Complaint Priority

| Keputusan | Nilai | Status |
|---|---|---|
| Priority terpisah dari status | ya | FINAL |
| Nilai | `NORMAL`, `PERLU_PERHATIAN` | FINAL |
| Kapan ditentukan | saat admin pertama membuka complaint `MENUNGGU` (wajib) | FINAL |
| `PERLU_PERHATIAN` sebagai status | tidak boleh | FINAL |
| Kombinasi valid | status × priority (8 kombinasi) | FINAL |

## 9. Complaint Response

| Keputusan | Nilai | Status |
|---|---|---|
| Admin merespons complaint | boleh | FINAL |
| Dicatat di ComplaintLog | status, priority, catatan/tanggapan | FINAL |
| Catatan saat DIPROSES/SELESAI/DITOLAK | boleh diberikan admin | FINAL |

## 10. Public Complaint Forum

| Keputusan | Nilai | Status |
|---|---|---|
| CREATE complaint | wajib login Google | FINAL |
| READ forum (SELESAI/DITOLAK) | tanpa login (guest/warga) | FINAL |
| Tampil publik | hanya `SELESAI` dan `DITOLAK` | FINAL |
| `MENUNGGU`/`DIPROSES` publik | tidak boleh | FINAL |

> Ini mengubah asumsi V1: tidak ada lagi toggle publikasi manual per complaint.
> Visibilitas publik diturunkan dari status final (`SELESAI`/`DITOLAK`).

## 11. Public Complaint Content

| Tampil publik | Disembunyikan |
|---|---|
| nomor tiket, kategori, judul | nama lengkap pelapor |
| deskripsi/catatan pengadu (tersanitasi) | email, telepon |
| status | OAuth/provider ID |
| priority (bila diputuskan tampil) | alamat pribadi |
| tanggal pengaduan | internal audit log |
| tanggal selesai/ditolak | private evidence path / storage key |
| tanggapan Admin | session info & data internal lain |

Prinsip: **Public Complaint Projection / sanitized DTO**. Jangan expose objek
database Complaint mentah ke public API.

## 12. Complaint Ownership

| Akses | WARGA (owner) | ADMIN_KELURAHAN | Guest/Public |
|---|---|---|---|
| Detail lengkap complaint sendiri | ya | — | tidak |
| Complaint aktif warga lain | tidak | — | tidak |
| Seluruh complaint (scope kelurahan) | tidak | ya | tidak |
| Public projection SELESAI/DITOLAK | ya | ya | ya |

## 13. Dashboard Warga

Sidebar: Riwayat Pengaduan, Profil. Header: notification bell.
Content: diagram statistik (SELESAI/DIPROSES/MENUNGGU/DITOLAK), riwayat inbox-like
(hanya milik warga), profil (foto + data relevan, tanpa ganti password), halaman
notifikasi penuh (mark as read, unread count, link terkait).

## 14. Dashboard Admin

Sidebar: Dashboard, Pengaduan, Pengumuman, Konten Kelurahan, Profil.
Header: notification bell.
Content: statistik + diagram status + diagram priority + ringkasan + queue tindak lanjut.
Pengaduan: "Perlu Ditindaklanjuti" (`MENUNGGU`,`DIPROSES`) dan "Sudah Selesai"
(`SELESAI`,`DITOLAK`). Admin dapat membuka, menentukan priority, memberi catatan,
mengubah status, melihat detail & history.

## 15. Announcement

| Keputusan | Nilai | Status |
|---|---|---|
| Tipe | `TEXT`, `PDF`, `VIDEO` | FINAL |
| Status | `DRAFT`, `PUBLISHED`, `ARCHIVED` | FINAL |
| Tampil publik | hanya `PUBLISHED` | FINAL |
| Admin dapat | create/edit/publish/unpublish/archive/upload PDF/kelola video | FINAL |
| Notifikasi warga | sesuai notification policy | FINAL |

## 16. Landing Page + CMS

| Keputusan | Nilai | Status |
|---|---|---|
| Akses | tanpa login | FINAL |
| Konten | dinamis, dikelola admin via CMS (bukan hard-code) | FINAL |
| Section | Hero, Profil, Sejarah (jika ada), Visi-Misi (jika ada), Statistik, Potensi, Fasilitas, Galeri, Pengumuman, Peta/Lokasi, Kontak | FINAL |
| Provenance statistik | source, source_table, source_year, source_page, verified_at | FINAL |
| Data resmi | jangan diubah tanpa verifikasi | FINAL |

## 17. Notification

Warga: complaint created, status changed, response/note, public announcement,
aktivitas personal relevan. Admin: complaint baru, priority PERLU_PERHATIAN,
aktivitas complaint penting, aktivitas operasional lain. Scope per recipient.

## 18. PWA

Manifest, icon 192x192 PNG, icon 512x512 PNG, service worker, offline fallback,
responsive/mobile-first. Jangan cache data pribadi/private response secara tidak aman.

## 19. Legacy Features (obsolete)

`kepala_lingkungan`, `lurah` terpisah, workflow verifikasi/forward, Facebook OAuth,
username warga, rating, leaderboard, legacy publication model, old handling status,
old public publication assumptions. Semua dimasukkan ke deprecation plan, tidak
langsung dihapus.

## 20. Data Migration (mapping, belum dieksekusi)

Lihat `V2_DATABASE_DELTA_PLAN.md`. Ringkasan mapping:

- `kepala_lingkungan`, `lurah` → `ADMIN_KELURAHAN`
- `warga` → `WARGA`
- `DIAJUKAN`, `DIVERIFIKASI`, `DITERUSKAN_KE_LURAH` → `MENUNGGU`
- `DALAM_PROSES` → `DIPROSES`
- `SELESAI` → `SELESAI`
- `DI_LUAR_KEWENANGAN` → `DITOLAK`

Rating lama ditandai legacy (archive/delete didokumentasikan terpisah).
Leaderboard legacy tanpa pengganti.

---

## Resolusi Konflik V1 ↔ V2

Konflik yang sebelumnya terbuka sekarang **selesai**:

| Konflik V1 (lama) | Keputusan V2 (final) | Status |
|---|---|---|
| 3 role vs 2 role | 2 role: `WARGA`, `ADMIN_KELURAHAN` | SELESAI |
| Alur Warga→Kepala Lingkungan→Lurah | alur admin langsung (workflow lama obsolete) | SELESAI |
| 6 status vs 4 status | 4 status final | SELESAI |
| priority tidak ada | priority `NORMAL`/`PERLU_PERHATIAN`, wajib saat buka pertama | SELESAI |
| rating ada | rating dihapus | SELESAI |
| leaderboard ada | leaderboard dihapus | SELESAI |
| publikasi complaint manual (DRAFT/PUBLISHED) | forum publik status-based (SELESAI/DITOLAK) | SELESAI |
| username warga wajib | username warga dihapus | SELESAI |
| landing hard-coded | CMS dinamis | SELESAI |
| announcement boolean `published` | `DRAFT`/`PUBLISHED`/`ARCHIVED` + TEXT/PDF/VIDEO | SELESAI |
| `PROJECT_SPEC.md` (V1) vs `docs/*` (V2) | `docs/*` + dokumen ini adalah source of truth; `PROJECT_SPEC.md` legacy | SELESAI |

## Item yang masih perlu verifikasi (BUKAN keputusan produk)

Ini bukan konflik requirement, tetapi memerlukan data/verifikasi lapangan sebelum
implementasi atau publikasi:

1. **Nama resmi 8 lingkungan (SLS).** V1 men-seed `Lingkungan 01..08` (placeholder).
   V2 melarang mengarang nama. Perlu daftar nama resmi dari kelurahan.
2. **Data statistik terbaru** yang menggantikan baseline BPS 2020 (belum tersedia).
3. **Sejarah, visi-misi, nama pejabat/Lurah, kontak resmi, koordinat kantor** —
   ditahan dari landing page sampai diverifikasi (sesuai master data).
4. **Foto resmi & lisensi/kredit** untuk hero/galeri (butuh foto asli Pinaras + izin).
5. **Nomor WhatsApp resmi kelurahan** untuk CTA (jika tetap diadopsi).
6. **Penyimpanan media** (object storage vs filesystem lokal) — keputusan teknis.
7. **Prioritas ditampilkan publik atau tidak** di forum (lihat §11; policy default:
   tampilkan bila ada, dengan catatan di spec publik).
8. **Penanganan data rating lama** — archive vs delete (final eksekusi di migration plan).

# SIPP V2 — Design Implementation Map

Peta pemetaan asset desain UI ke implementasi. **Desain = visual reference**,
sedangkan `docs/*` = business source of truth. Jika teks pada gambar desain
bertentangan dengan docs V2, docs V2 menang.

> **Keterbatasan pemetaan:** model pada sesi ini tidak dapat membaca isi visual
> gambar (PNG) secara langsung. Inventarisasi di bawah diturunkan dari **nama file**
> yang deskriptif, token desain yang sudah ada di kode (`src/app/globals.css`,
> `src/components/dashboard-shell.tsx`), dan arahan desain pengguna (siluet alam
> Tomohon sebagai latar). Nilai warna/tipe huruf persis pada PNG perlu diekstrak
> manual (atau disampling saat implementasi) sebelum diterapkan 1:1.

---

## A. Design Asset Inventory

Lokasi: `public/images/`

| Filename | Jenis halaman | Target route V2 | Target user | Status |
|---|---|---|---|---|
| `DESAIN LANDING PAGE.png` | Landing page publik | `/` | Guest/Public | reference (baru, 06/10) |
| `DESAIN LOGIN.png` | Halaman login | `/login` | Public | reference (baru, 06/10) |
| `DESAIN NEW DASHBOARD WARGA.png` | Dashboard warga | `/warga` | WARGA | reference |
| `DESAIN NEW DASHBOARD LURAH.png` | Dashboard admin (dari desain V1 "Lurah") | `/admin` | ADMIN_KELURAHAN | reference (role diganti) |
| `DESAIN NEW DASHBOARD KEPALA LINGKUNGAN.png` | Dashboard operasional (dari desain V1 "Kepala Lingkungan") | (diadopsi pola untuk queue complaint admin) | — (role obsolete) | reference (role obsolete) |
| `panorama-pinaras.png` | Siluet/hero panorama Tomohon | global (hero + background) | semua | **reuse aktif** |
| `google-logo.jpg` | Logo tombol Google login | `/login` | Public | **reuse aktif** |

Catatan:
- `DESAIN NEW -sipp-reference OLD.png` **telah dihapus** (terlihat di `git status` sebagai `D`).
- Tidak ada file desain khusus untuk: riwayat/detail pengaduan, halaman notifikasi,
  CMS admin, profil, editor pengumuman, dan detail complaint admin. Pola visualnya
  diturunkan dari 5 file desain di atas.
- `DESAIN ... LURAH` dan `... KEPALA LINGKUNGAN` memakai role lama. Struktur
  menu/role-nya **tidak** berlaku di V2; hanya gaya visual (warna, sidebar, kartu,
  badge) yang diadopsi untuk dashboard `ADMIN_KELURAHAN`.

## B. Page-to-Feature Mapping

| Halaman | Target user | Sifat | Route V2 | Sumber desain |
|---|---|---|---|---|
| Landing page | Public | dynamic CMS | `/` | `DESAIN LANDING PAGE.png` |
| Login | Public | Google OAuth (warga) + credentials (admin) | `/login` | `DESAIN LOGIN.png` |
| Warga dashboard | WARGA | protected | `/warga` | `DESAIN NEW DASHBOARD WARGA.png` |
| Riwayat pengaduan | WARGA | protected | `/warga/pengaduan` | turunan dari dashboard warga |
| Detail pengaduan (private) | WARGA owner | protected | `/warga/pengaduan/[ticketNumber]` | turunan |
| Notifikasi | WARGA + ADMIN | protected | `/notifikasi` | turunan (bell + list) |
| Admin dashboard | ADMIN_KELURAHAN | protected | `/admin` | `DESAIN ... LURAH.png` |
| Admin complaint (queue) | ADMIN_KELURAHAN | protected | `/admin/pengaduan` | `DESAIN ... KEPALA LINGKUNGAN.png` (pola) |
| Announcement editor | ADMIN_KELURAHAN | protected | `/admin/pengumuman` | turunan |
| CMS / Konten Kelurahan | ADMIN_KELURAHAN | protected | `/admin/konten` | turunan |
| Profil | WARGA + ADMIN | protected | `/warga/profil`, `/admin/profil` | turunan |
| Public complaint forum | Public | public | `/pengaduan`, `/pengaduan/[ticketNumber]` | `DESAIN LANDING PAGE.png` (pola) |

## C. Component Mapping (lama → V2)

| Komponen V1 | Reusable | Perlu adaptasi | Harus diganti |
|---|---|---|---|
| `dashboard-shell.tsx` | — | ✅ (role/menu berubah; unifikasi palette) | — |
| `notification-bell.tsx` | ✅ | ringan (generic link + full page) | — |
| `text-prompt-dialog.tsx` | ✅ | — | — |
| `logout-button.tsx` | ✅ | — | — |
| `service-worker-register.tsx` | ✅ | — | — |
| `complaint-form.tsx` | — | ✅ (hapus lingkungan/username, tambah lokasi) | — |
| `public-complaint-list.tsx` | — | ✅ (status-based, sanitized DTO) | — |
| `announcement-form.tsx` | — | — | ✅ (ganti status + media type) |
| `rating-control.tsx` | — | — | ✅ (fitur dihapus) |
| `publication-control.tsx` | — | — | ✅ (publikasi manual dihapus) |
| `username-form.tsx` | — | — | ✅ (username dihapus) |
| `neighborhood-inbox.tsx` | — | — | ✅ (role obsolete) |
| `lurah-inbox.tsx` | — | — | ✅ (workflow obsolete) |

## D. Design System Mapping

Token yang sudah ada di kode (akan dijadikan satu sumber; **dua sistem yang sekarang
bertabrakan harus disatukan**):

| Token | `globals.css` (landing) | `dashboard-shell.tsx` (dashboard) | Rekomendasi V2 |
|---|---|---|---|
| Background | `--surface #f4f6f3` | `#f5f8fc` | satukan ke satu `--surface` |
| Primary text/ink | `--ink #122b3a` | `#173b68` / `#102b50` | satukan (candidate `#122b3a`) |
| Accent | `--accent #c52f35` (merah) | `#2f83ed` (biru) | konfirmasi dari PNG (bila tidak ada, satukan) |
| Muted | `--muted #66757d` | `#7890ae` | satukan |
| Border | `--line #d9e1df` | `#e0e9f4` | satukan |
| Gold/highlight | `--gold #b37713`, `--gold-soft #fff4d6` | — | pertahankan untuk badge/rating-like |
| Soft accent | `--soft-accent #f8e5e2` | — | pertahankan |
| Font | `"Trebuchet MS","Segoe UI",sans-serif` | sama (warisan) | konfirmasi dari PNG |

Arah desain final (sesuai permintaan pengguna):
- **Siluet alam Tomohon** (gunung/pinus/lanskap) sebagai lapisan latar belakang di
  hero, footer, dan panel dashboard; gunakan `panorama-pinaras.png` + gradasi overlay
  gelap agar teks tetap kontras.
- **Typography:** besar, mudah dibaca (mobile-first), bahasa Indonesia sederhana.
- **Card:** rounded, border tipis, shadow lembut, background putih di atas `--surface`.
- **Button:** pill/rounded, accent solid untuk aksi utama, outline untuk sekunder.
- **Badge/status:** warna per status complaint (`MENUNGGU` abu/kuning, `DIPROSES` biru,
  `SELESAI` hijau, `DITOLAK` merah) + badge priority (`NORMAL` netral, `PERLU_PERHATIAN` tegas).
- **Sidebar (dashboard):** gelap (ink), menu bertingkat, indikator aktif.
- **Navbar/header:** putih, bell notifikasi, avatar, nama user.
- **Notification:** dropdown list + halaman penuh, unread count.
- **Charts:** sederhana (donut/bar) untuk status & priority; library ringan.
- **Forms:** input rounded, border `--line`, focus accent.
- **Tables:** untuk admin queue; zebra/ringkas, mobile collapse.
- **Responsive:** sidebar → top-bar/scroll pada <900px (sudah ada di `globals.css`).

## E. Asset Reuse

| Asset | Keputusan |
|---|---|
| `panorama-pinaras.png` | reuse untuk hero/background siluet (jangan duplikat) |
| `google-logo.jpg` | reuse untuk tombol Google login |
| `icon-192.svg` / `icon-512.svg` | reuse sementara; **wajib tambah PNG 192/512** (PWA) |
| 5 file `DESAIN...` | **referensi desain**, bukan asset runtime; tidak di-serve sebagai image halaman |

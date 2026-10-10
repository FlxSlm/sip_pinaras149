# SIPP — Laporan redesign Tahap 1

Tanggal: 10 Oktober 2026.

Implementasi fondasi UI telah diterapkan. Pemeriksaan otomatis dan HTTP selesai;
verifikasi visual browser belum dapat dilakukan. Komposisi penuh halaman pada
Tahap 2–4 belum dikerjakan. Tidak ada klaim seluruh redesign atau kesiapan
production telah selesai.

## Audit dan rencana

Dokumen V2, source frontend, panduan Next.js lokal versi 16.3.1, serta seluruh
isi `public/images` diperiksa sebelum perubahan. Tujuh PNG/JPG dilihat langsung;
HEIC dibaca metadatanya, tetapi preview gagal karena decoder HEVC tidak tersedia.
Inventaris, dimensi, interpretasi visual, pemetaan route, dan konflik mockup
dicatat dalam `docs/DESIGN_IMPLEMENTATION_MAP.md`.

Urutan implementasi: token → komponen bersama → shell/navigasi → dialog dan
notifikasi → fallback loading/error → verifikasi. Backend dan data dipertahankan.

## File diubah

- `src/app/globals.css`: token biru/hijau berdasarkan mockup, latar terang,
  font sistem sans serif, styling kontrol/kartu/tabel/badge, fokus keyboard,
  modal/drawer, sidebar foto, reduced motion yang tetap dipertahankan.
  `overflow-x: hidden` global dihapus agar overflow tidak sekadar disembunyikan.
- `src/app/layout.tsx`: viewport dan warna browser sesuai identitas UI,
  tanpa membatasi zoom pengguna. Service worker dan metadata tetap.
- `src/app/page.tsx`: mengganti navbar inline dengan `PublicHeader`, menambah
  target skip navigation serta ruang header 72 px. Konten/CMS dan pengambilan
  data landing tidak diubah; ini integrasi fondasi navigasi, bukan redesign
  seluruh landing.
- `src/components/dashboard-shell.tsx`: sidebar biru, menu aktif, header terang,
  identitas SIPP V2, avatar/link profil, drawer mobile, close pada breakpoint
  desktop, skip link, footer tanpa emoji. Link role tetap sesuai route asal.
- `src/components/confirm-dialog.tsx`: modal native berlabel, styling konsisten,
  fokus awal tombol pembatalan, aksi bertumpuk pada layar kecil.
- `src/components/text-prompt-dialog.tsx`: modal native, label textarea unik,
  tetap memakai initialValue, trim, disable kosong, dan callback asal.
- `src/components/status-badge.tsx`: empat status tetap memakai helper asal,
  warna token dan teks yang lebih mudah dibaca.
- `src/components/notification-bell.tsx`: ikon konsisten, hit target 44 px,
  label jumlah belum dibaca untuk pembaca layar, badge merah seperti mockup.
- `src/components/notification-list.tsx`: daftar kartu, state loading/kosong/error,
  retry, tombol baca yang terpisah dari tautan detail. Payload PATCH tetap
  `{ id }` atau `{}`; tampilan dibaca hanya diperbarui setelah response sukses.
- `src/components/logout-button.tsx`: memakai Button/ikon bersama; konfirmasi
  dan `signOut({ callbackUrl: "/" })` tetap.
- `docs/DESIGN_IMPLEMENTATION_MAP.md`: mengganti pemetaan lama yang berdasarkan
  asumsi nama file dengan pemeriksaan aset aktual.

## File baru

- `src/components/ui/icon.tsx`: ikon SVG tanpa dependency tambahan.
- `src/components/ui/primitives.tsx`: Button, Card, Input, Select, Textarea,
  Notice, EmptyState, LoadingState, TableContainer, dan helper styling link aksi.
- `src/components/ui/dialog.tsx`: dialog/drawer native bersama, Escape,
  klik backdrop, scroll lock, focus containment dan restoration melalui browser.
- `src/components/public-header.tsx`: navbar terang dengan aksen hijau dan
  navigasi mobile modal; semua menu mempunyai tujuan nyata.
- `src/app/loading.tsx`: fallback loading tanpa data pribadi.
- `src/app/error.tsx`: fallback error dengan retry Next.js 16.3 dan tautan
  beranda; tidak menampilkan pesan error mentah dari server.
- `src/components/ui-foundation.test.ts`: 10 tes markup SSR untuk menu publik,
  navigasi per role, active state route anak, skip link, dialog/label,
  prompt kosong, status teks, live region dan tipe tombol.
- `src/components/ui-contrast.test.ts`: 11 tes kontras berdasarkan token CSS
  aktual; kombinasi teks diuji minimal 4,5:1, fokus di atas putih minimal 3:1.
- `docs/UI_REDESIGN_STAGE_1.md`: laporan ini.

Komponen dasar tersedia untuk migrasi halaman selanjutnya. Input/Select/
TableContainer belum dipakai di seluruh form/tabel lama; keseragaman penuh
dikerjakan ketika komposisi halaman terkait diubah.

## Fitur dan integritas yang dipertahankan

Route, request/response API, validasi server, session, pembatasan role dan
ownership, CMS, complaint workflow, upload, storage, Prisma dan migration
tidak diubah. Tidak ada seed, reset/modifikasi database, dependency baru,
perubahan environment variable, atau deployment.

Tidak ada migration dibuat, diedit, atau dijalankan. Tidak ada aset
`public/images` diubah, dipindah, atau dihapus oleh pekerjaan ini. Tiga
penghapusan mockup lama, HEIC untracked, `.kilo`, `.vscode`, dan handoff file
sudah berada pada working tree sebelumnya dan dipertahankan.

Penggunaan Google OAuth warga dan credentials admin tetap. Tidak ditambahkan
role, registrasi, lupa-password backend, atau password warga.

## Perintah dan hasil aktual

- Pembacaan dokumen/source dengan `Get-Content`, pencarian `rg`, inventaris
  `Get-ChildItem` + System.Drawing, inspeksi PNG/JPG dengan `view_image`.
- Pembacaan metadata HEIC dengan Sharp tersedia. Percobaan membuat preview
  HEIC gagal: build Sharp tidak mendukung decoder HEVC. Aset sumber tetap.
- `npm.cmd run typecheck`: **lulus**, exit 0.
- `npm.cmd test`: **lulus**, 73 tes di 10 file; 21 tes UI baru. Tes otorisasi,
  ownership, proyeksi publik, workflow, auth, dan upload yang ada tetap lulus.
- `npm.cmd run build`: **lulus**, compile, TypeScript, dan generation 14 halaman
  statis; seluruh route dinamis tetap tercantum.
- `npm.cmd run lint`: **gagal**, dua error `@typescript-eslint/no-require-imports`
  pada `check_checksum.js` baris 1–2. File tersebut telah tracked sebelum task
  dan tidak diubah karena berada di luar scope redesign.
- ESLint khusus seluruh TS/TSX redesign: **lulus**. CSS tidak memiliki
  konfigurasi lint ESLint; validitas kompilasinya diperiksa melalui build.
- `git diff --check`: **lulus**, tanpa error whitespace. Git menampilkan
  pemberitahuan normalisasi LF/CRLF, bukan kegagalan pemeriksaan.
- Pemeriksaan diff pada `src/app/api`, `src/lib`, `prisma`, package manifests,
  dan `next.config.ts`: tidak ada perubahan.

Perintah `npm` langsung terkena ExecutionPolicy PowerShell; perintah yang
dipakai kemudian adalah `npm.cmd`. Percobaan server lokal terkena pembatasan
port sandbox; setelah eskalasi diketahui server dev workspace sudah berjalan
di localhost:3000 (PID 14332). Server tersebut dipakai read-only dan tidak
dihentikan. Tidak ada perubahan konfigurasi mesin untuk mengatasi hambatan ini.

HTTP GET terhadap server lokal (tanpa sesi, tanpa POST/PATCH/seed):

- `/`, `/login`, `/offline`, `/pengaduan`, `/pengumuman`: 200,
  tidak menunjukkan fallback error baru.
- `/warga`, `/admin`: 307 ke login dengan callback route masing-masing.
- `/api/me`, `/api/notifications`: 401.

Ini memverifikasi akses tamu pada route tersebut, bukan pengujian login OAuth
atau sesi warga/admin end-to-end.

## Kesesuaian dan batas verifikasi

Fondasi mengikuti sidebar biru/foto, active menu biru, header putih, kartu
putih/latar biru muda pada dashboard; navbar terang dan aksen hijau pada
mockup publik/login. Warna disesuaikan untuk kontras, bukan diklaim sebagai
sampling persis. Font mockup tidak dapat dikenali pasti; tanpa aset font,
digunakan font sistem. Foto yang tersedia berbeda dari foto gunung pada mockup.

Browser inventory kosong; percobaan membuka in-app browser ditolak karena
browser tidak tersedia. Oleh sebab itu tidak ada screenshot baseline/hasil,
pengukuran overflow, perbandingan pixel, atau tes keyboard nyata yang diklaim
berhasil. SSR dan tes kontras tidak menggantikan pengujian browser.

Pemeriksaan berikut masih diperlukan memakai data sintetis pada 360, 390,
768, 1024, dan 1440 px:

- Header/navbar/sidebar/drawer: overflow, menu dapat dijangkau, active state,
  scroll internal pada viewport pendek, perubahan breakpoint.
- Dialog: Tab/Shift+Tab, Escape, backdrop, fokus kembali, textarea panjang.
- Form/tabel/kartu: nama/judul panjang, empty/loading/error/disabled state,
  scroll tabel lokal, kontrol upload dan menu CMS.
- Notifikasi: load, retry, mark one/all read, link detail, failure API.
- Login nyata serta navigasi warga/admin dengan session masing-masing.

## Pekerjaan selanjutnya dan risiko yang belum selesai

Tahap 2: komposisi penuh halaman publik dan login; Tahap 3–4: komposisi area
warga/admin serta migrasi pemakaian komponen bersama. Foto HEIC perlu preview/
konversi dan verifikasi provenance; logo Google memerlukan aset yang bersih.

Komposisi diagram dashboard lama mengabaikan Ditolak dan mencampurkan status
dengan prioritas. Mockup juga mengandung inkonsistensi ini. Perbaikan UI grafik
harus mengikuti aturan V2 ketika dashboard dikerjakan, tanpa mengubah backend.

Lint repository dan verifikasi visual masih terbuka. Temuan keamanan,
migration/media, dan deployment dari audit sebelumnya merupakan pekerjaan
terpisah; redesign fondasi tidak menyelesaikan atau menghapus temuan tersebut.

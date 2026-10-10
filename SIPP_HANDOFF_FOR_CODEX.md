# SIPP V2 — Project Handoff for Codex / New ChatGPT Account

> Tujuan dokumen ini: membantu Codex memahami proyek SIPP V2 tanpa bergantung pada riwayat percakapan di akun ChatGPT lain. Dokumen ini merangkum keputusan produk dan status yang dilaporkan Agent sebelumnya. **Repository dan hasil pemeriksaan terbaru tetap menjadi sumber kebenaran**; verifikasi keadaan file aktual sebelum mengambil tindakan.

## 1. Gambaran proyek

SIPP V2 adalah aplikasi Sistem Informasi Pengaduan/Pelayanan untuk Kelurahan Pinaras, Tomohon. Stack yang dilaporkan:

- Next.js 16.x, React 19, TypeScript, Tailwind CSS 4
- Prisma 7 dengan PostgreSQL
- NextAuth v4
- Vitest
- PWA (manifest, ikon, offline fallback)
- Integrasi Vercel direncanakan untuk hosting; Vercel Blob untuk penyimpanan file

Gunakan `package.json`, `prisma/schema.prisma`, `prisma.config.ts`, `AGENTS.md`, `docs/`, dan seluruh kode yang ada untuk memverifikasi versi dan arsitektur aktual. Jangan mengandalkan dokumen ini jika bertentangan dengan repository terbaru.

## 2. Keputusan produk yang harus dipertahankan

### Role dan autentikasi

- Role database hanya `WARGA` dan `ADMIN_KELURAHAN`.
- Guest/publik bukan role database; landing page dan forum publik tertentu dapat diakses tanpa login.
- Warga login menggunakan Google OAuth saja. Tidak ada registrasi mandiri, username warga, atau password warga.
- Admin kelurahan menggunakan credentials internal. Akun admin dibuat melalui proses seed/administrasi yang aman; tidak ada registrasi mandiri admin.
- Jangan menambahkan kembali role Kepala Lingkungan atau Lurah, Facebook OAuth, leaderboard, rating, NIK, maupun username warga tanpa keputusan produk baru yang eksplisit.

### Alur pengaduan

- Status: `MENUNGGU`, `DIPROSES`, `SELESAI`, `DITOLAK`.
- Prioritas terpisah dari status: `NORMAL`, `PERLU_PERHATIAN`.
- Alur: `MENUNGGU` dapat menuju `DIPROSES`, `SELESAI`, atau `DITOLAK`; `DIPROSES` dapat menuju `SELESAI`. Penolakan hanya dari `MENUNGGU`.
- Nomor tiket: `LPR-YYYYMM-###`, dengan mekanisme sequence/uniqueness sesuai implementasi yang ada.
- Warga hanya melihat pengaduannya sendiri. Admin dapat mengelola semua pengaduan.
- Forum publik hanya memperlihatkan pengaduan `SELESAI` dan `DITOLAK` menggunakan DTO/proyeksi publik yang disanitasi. Jangan bocorkan identitas warga, alamat privat, email, nomor telepon, OAuth IDs, storage keys privat, atau log internal.
- Catatan pengadu dan respons admin yang tampil di forum harus diperiksa/redaksi PII-nya sebelum publikasi.
- Bukti pengaduan adalah data privat; semua pembacaan file harus memeriksa sesi, kepemilikan, atau hak admin di server.

### Pengumuman dan CMS

- Admin mengelola pengumuman tipe catatan/teks, PDF, dan video.
- Aksi yang dikehendaki: simpan Draft, Terbitkan, Jadikan Draft. Jangan menambahkan kembali tombol Arsipkan sebagai aksi UI tanpa persetujuan.
- Media pengumuman Draft tidak boleh diakses publik. Media hanya ditampilkan ke publik ketika status publikasinya mengizinkan.
- Landing page bersifat dinamis melalui CMS/database: profil, statistik, potensi, fasilitas, galeri/media, pengumuman, lokasi, dan kontak sesuai implementasi.
- Jangan mengarang data Kelurahan Pinaras. Pertahankan provenance/source untuk data statistik dan tandai informasi belum diverifikasi.

### Dashboard dan navigasi

- Sidebar desktop persisten; sidebar mobile menjadi drawer.
- Klik menu membuka route nyata, bukan hanya scroll anchor.
- Dashboard warga/admin adalah halaman ringkasan, bukan pengganti halaman fitur terpisah.
- Notifikasi memiliki daftar/halaman sendiri.
- Profil warga menunjukkan foto, nama, dan email Google; tidak menampilkan username/password warga.
- Admin dapat mengubah password. Jangan log atau mengekspos password/token.

## 3. Arah desain UI yang diinginkan

Tujuan berikutnya adalah meningkatkan kualitas visual agar terlihat modern, rapi, profesional, dan konsisten tanpa mengorbankan aksesibilitas atau alur yang sudah berfungsi.

Prinsip desain:

- Modern, bersih, profesional, dengan hierarki visual kuat dan typography mudah dibaca.
- Gunakan font umum yang konsisten (Inter/system-ui, Segoe UI, Roboto atau sans-serif yang ada di proyek); hindari font dekoratif/script.
- Palet utama biru/hijau/putih yang sesuai identitas pemerintahan lokal.
- Gunakan fotografi alam Tomohon/Pinaras secara subtil dan relevan, terutama pada landing page dan bila cocok pada latar sidebar.
- Hindari “AI slop”: terlalu banyak ikon/stiker, emoji, floating cards, gradient berlebihan, ruang kosong besar, hiasan yang tidak bermakna, dan banyak komponen kartu seragam.
- Pastikan kontras, ukuran teks, fokus keyboard, reduced-motion, responsivitas, dan tampilan layar kecil.
- Jangan mengubah fungsi, role, akses data, API, atau database hanya untuk mengejar desain.
- Sebelum perombakan UI, audit semua halaman dan rute terlebih dahulu lalu usulkan design system dan urutan implementasi. Implementasi dilakukan bertahap per halaman/kelompok fitur setelah rencana disetujui.

## 4. Status implementasi yang dilaporkan sebelumnya

Bagian ini adalah **laporan dari Agent sebelumnya**, bukan jaminan bahwa file aktual saat ini persis sama. Verifikasi melalui Git diff dan kode.

- Phase 5A dilaporkan selesai: alur pengaduan, profil, pergantian password admin, pengumuman teks/PDF/video, chart, dialog konfirmasi; lint/typecheck/test/build dilaporkan lolos.
- Phase 5B dilaporkan diterapkan: redesign login, landing, dashboard warga/admin, `DonutChart`, sidebar bergambar alam, Inter/system font, responsive shell, animasi dan reduced-motion. Perbaikan berikutnya mengganti emoji bell menjadi SVG dan menambah `overscroll-behavior`.
- Phase 6 dilaporkan selesai: auth/authorization, ownership pengaduan, alur status, prioritas, sanitasi forum publik, notifikasi; 44 tes pada saat itu dilaporkan lulus.
- Phase 7B dilaporkan: `@vercel/blob` ditambahkan; `postinstall: prisma generate`; `engines.node` diset ke `24.x`; seed admin dibuat gagal dengan aman jika `ADMIN_SEED_PASSWORD` kosong/kurang dari 8 karakter. Lint/typecheck/test/build lulus pada saat itu.
- Phase 7C foto profil terhenti sebagian karena keterbatasan token, lalu ada beberapa perbaikan lanjutan:
  - `User.customImage String?` ditambahkan ke `prisma/schema.prisma`.
  - `src/app/api/profile/photo/route.ts` diubah untuk direct upload via `handleUpload`, GET Private Blob menggunakan `get(..., { access: 'private' })`, dan DELETE.
  - `src/components/profile-photo-form.tsx` diubah menggunakan `@vercel/blob/client`.
  - `src/app/api/me/route.ts` dan halaman profil/admin/warga dikabarkan disesuaikan untuk memakai URL proxy dan fallback foto Google OAuth.
  - Route lama `src/app/api/profile/photo/[filename]/route.ts` dikabarkan dihapus.
  - `src/app/api/profile/photo/route.test.ts` ditambahkan/diperbarui.
  - Tes terbaru yang dilaporkan lulus: 8 test files, 52 tests, serta lint/typecheck/build. Blob store sebenarnya belum dikonfigurasi/diuji.

## 5. Blocker saat ini: Prisma migration drift

Agent sebelumnya melaporkan masalah pada migration:

`prisma/migrations/20261006000000_v2_roles_complaint_content/migration.sql`

Laporan Agent menyebut tabel `_prisma_migrations` memiliki record gagal dan record berhasil untuk nama migration yang sama. Versi file SQL saat ini cocok dengan checksum record yang berhasil, sementara record kegagalan berasal dari upaya sebelumnya. Ini harus dikonfirmasi langsung oleh Codex secara read-only.

Laporan Agent juga menyebut perbedaan schema berikut:

1. `User.customImage` belum tercakup dalam migration baru.
2. `SiteContent.updatedAt` memiliki perbedaan default antara migration lama dan `prisma/schema.prisma` (`@updatedAt` versus SQL dengan `DEFAULT CURRENT_TIMESTAMP`).

**Jangan langsung menghapus baris `_prisma_migrations`, jangan mengedit migration lama, jangan menjalankan `migrate reset`, dan jangan memakai `db push` untuk menutupi masalah.** Sebelum perubahan, minta Codex:

1. Periksa Git status/log/diff dan file migration secara read-only.
2. Pastikan backup database development tersedia, tanpa menampilkan `.env.local` atau kredensial.
3. Uji seluruh rangkaian migration pada database PostgreSQL uji yang benar-benar terpisah dan kosong.
4. Bandingkan database uji dengan `schema.prisma`.
5. Laporkan opsi pemulihan paling aman dan tunggu persetujuan sebelum mengubah file/database.

Pernah ada script investigasi sementara `check_checksum.js` / `check_checksum.ts`; periksa apakah masih ada, apakah mengandung kredensial, serta apakah dilacak Git. Jangan mencetak isinya jika mungkin mengandung secret.

Catatan keamanan: percakapan/log investigasi terdahulu menampilkan connection string PostgreSQL. Jika password tersebut masih aktif, rotasi password-nya dan perbarui `.env.local`; jangan menyalin password lama ke laporan, prompt, repository, atau dokumen handoff. Pastikan file `.env.local` tidak di-track Git.

## 6. Blocker deployment Vercel

Jangan deploy production sampai audit dan persiapan berikut selesai:

- Database PostgreSQL production yang terpisah dari lokal dan migration yang dapat dibangun dari awal.
- Variabel environment production telah didata dari kode aktual: `DATABASE_URL`, secret NextAuth yang benar-benar dibaca kode, Google OAuth client ID/secret, `ADMIN_SEED_PASSWORD`, dan token/storage config saat diperlukan. Jangan mengarang nama variable; periksa `src/lib/auth.ts`, Prisma config, dan kode upload.
- Google OAuth callback URL domain production telah dikonfigurasi di Google Cloud Console.
- Vercel Blob store dibuat dan environment token dihubungkan. Pastikan jenis akses Blob cocok dengan data:
  - Bukti pengaduan dan foto privat harus memakai private access dan pemeriksaan otorisasi.
  - Media publik/draft harus mengikuti lifecycle publikasi; jangan menganggap URL unguessable sebagai authorization.
  - Upload video sampai 50 MB perlu jalur direct/signed client upload yang sesuai dengan batas body serverless.
- Audit seluruh penggunaan filesystem lokal, termasuk `fs.writeFile`, `readFile`, `createReadStream`, `process.cwd()/storage`, dan route pembacaan file. Foto profil bukan satu-satunya upload.
- Rencanakan migrasi file lokal bila ada data/media yang sudah direferensikan database; jangan menghapus sumber sebelum pemindahan dan validasi berhasil.
- Jangan menjalankan seed pada setiap build.
- Periksa `.gitignore`; jangan commit `.env`, `.env.local`, token, password, dump database, atau script yang memuat kredensial.
- Jalankan lint, typecheck, test, build, dan pengujian end-to-end staging sebelum production.

## 7. Rencana kerja yang diinginkan

Ikuti urutan ini dan kerjakan satu tahap pada satu waktu:

### Tahap A — Repository & safety audit (READ-ONLY)
- Baca `AGENTS.md`, dokumentasi di `docs/`, `package.json`, `prisma/schema.prisma`, `prisma.config.ts`, riwayat migrations, serta Git status/diff.
- Jangan mengubah file atau DB.
- Laporkan kondisi aktual dan beda dengan dokumen handoff ini.

### Tahap B — Stabilkan database/migration
- Backup dan database test terpisah.
- Pastikan seluruh migration bisa diterapkan pada DB kosong.
- Rencanakan pemulihan drift dengan aman; tunggu persetujuan sebelum edit.

### Tahap C — Selesaikan storage
- Validasi foto profil Private Blob end-to-end.
- Migrasikan bukti pengaduan ke private object storage dengan akses terotorisasi.
- Migrasikan upload PDF/video pengumuman dan media CMS sesuai visibilitas dan batas ukuran.
- Tangani media lokal yang sudah ada.
- Uji akses lintas pengguna, akses guest, draft/published, upload besar, unduh, dan pemutaran video.

### Tahap D — UI/UX overhaul
- Audit halaman dan screenshot aktual terlebih dahulu.
- Buat design system ringkas: warna, typography, spacing, buttons, forms, tables, cards, navigation, empty/loading/error states.
- Usulkan prioritas per halaman (landing/login, warga, admin, inbox/riwayat, detail pengaduan, pengumuman, CMS, profil, notifikasi).
- Tunggu persetujuan rencana sebelum implementasi.
- Implementasikan per kelompok halaman; pertahankan semua izin, route, form validation, dan perilaku kerja.

### Tahap E — Deploy staging ke Vercel
- Hubungkan GitHub repository.
- Konfigurasi environment per environment (Preview/Production).
- Gunakan database staging/test yang terpisah dari lokal dan production.
- Jalankan migration hanya setelah ditinjau.
- Uji Google OAuth, admin login, alur pengaduan, privasi, media, responsive/mobile, dan PWA.

### Tahap F — Production readiness
- Buat checklist go-live, backup/restore database, monitoring, penanganan error, keamanan header/rate limits, dan prosedur rollback.
- Jangan menyatakan siap production sampai tes yang relevan benar-benar dijalankan.

## 8. Cara kerja Codex yang wajib diikuti

- Mulai dengan **READ-ONLY AUDIT**, bukan langsung coding.
- Gunakan Git diff; jangan merusak perubahan uncommitted.
- Satu scope jelas per tugas; hindari refactor luas tidak terkait.
- Jangan reset/drop database, memodifikasi `_prisma_migrations`, atau menghapus file/media tanpa persetujuan eksplisit.
- Jangan menampilkan, menyalin, mengunggah, atau menyimpan secret. Jangan membaca `.env.local` untuk kemudian mencetak nilainya.
- Bedakan fakta yang diperiksa langsung dari asumsi/laporan Agent sebelumnya.
- Jangan mengklaim lint, test, build, upload Blob, atau login OAuth lolos kecuali benar-benar berhasil diuji.
- Setelah setiap tahap: laporkan file berubah, alasan, hasil verifikasi, migrasi/risiko, dan langkah berikutnya. Berhenti untuk persetujuan bila menyentuh database, keamanan, storage, atau perubahan scope besar.

## 9. Prompt pertama yang disarankan

"Baca `SIPP_HANDOFF_FOR_CODEX.md`, `AGENTS.md`, dan dokumen relevan di `docs/`. Lakukan **read-only audit** atas repository yang sedang dibuka, termasuk `git status`, diff, migration history, foto profil Private Blob, serta semua lokasi filesystem upload. Jangan mengubah file, install dependency, menjalankan migrasi/seed, atau mengakses/menampilkan secret. Laporkan kondisi aktual, blocker deployment, ketidakcocokan dengan dokumen handoff, dan rencana kerja berurutan. Berhenti dan tunggu persetujuan saya."

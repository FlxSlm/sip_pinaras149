# Laporan perbaikan SIPP — 14 Oktober 2026

## Hasil

Keempat belas permintaan telah diimplementasikan di workspace. Migrasi fitur dan penggantian username telah diterapkan pada PostgreSQL lokal dan target Neon yang diparse secara eksplisit dari `.env.vercel-production.local`. **Kode baru belum dideploy ke Vercel; hasil browser dalam laporan ini berasal dari pengujian lokal, bukan Production.**

Username akun aplikasi kini `kkt149unsrat@pinaras.com`. Operasi database hanya mengganti username akun yang sudah ada; verifikasi setelah migrasi memastikan ID, role `ADMIN_KELURAHAN`, dan password tetap sama. Username berbentuk alamat email ini tetap dipakai melalui login kredensial admin, bukan login Google. Email akun tidak diubah.

## Perilaku yang berubah

1. **Username admin:** migrasi mengganti nama akun lama dan menolak benturan dengan akun lain. Konstanta username serta skrip inisialisasi/smoke diperbarui. Skrip inisialisasi tidak membuat akun duplikat ketika username lama masih ada.
2. **Navigasi:** App Router Next.js sudah mendukung navigasi klien dengan `Link`. Layout dashboard kini menetap ketika halaman berganti; pemeriksaan sesi dideduplikasi dalam satu request, data profil awal datang dari server, dan tindakan yang memerlukan pembaruan memakai `router.refresh()`. Skeleton memberikan umpan balik saat data halaman belum siap. Tidak diperlukan penulisan ulang menjadi SPA penuh.
3. **Brand:** nama produk menjadi SIPP pada login, header, sidebar, footer, hero, dan manifest. Nama wilayah Kelurahan Pinaras dan kepanjangan SIPP tetap digunakan sesuai konteks.
4. **Responsif:** header login mengikuti aliran layout, judul tidak bertabrakan dengan logo, ikon layanan memakai grid, dan kartu/form/struktur menyesuaikan lebar layar. Tabel dapat digulir dalam wadahnya.
5. **Lokasi pengaduan:** pilihan Lingkungan 1–8 dan Tidak Tahu divalidasi di server, disimpan terpisah dari alamat/patokan, serta tampil pada detail privat admin dan warga. Pengaduan lama tetap bernilai null untuk lingkungan yang tidak diketahui.
6. **HEIC:** foto HEIC/HEIF dikonversi di browser menjadi JPEG sebelum unggahan; modul konversi dimuat hanya saat diperlukan. Pemeriksaan tipe, ukuran dan isi berkas di server tetap berlaku. Batas foto 5 MB sebelum dan sesudah konversi. Konversi juga tersedia untuk foto profil dan foto pejabat.
7. **Luas:** landing page menampilkan 3,96 km². Angka sumber lama 3,98 km² beserta metadata BPS tetap disimpan. Pembaruan pengguna tidak diatribusikan sebagai angka BPS 2020.
8. **Struktur:** menu publik menampilkan 28 posisi sesuai bagan pengguna, termasuk delapan pasangan kepala/wakil lingkungan. Nama yang kosong pada gambar tetap belum diisi. Desain memakai kartu putih dan aksen biru. CMS hanya mengizinkan admin mengubah nama/foto posisi tersebut; perubahan section CMS lama ditolak. Data lama tidak dihapus. NIP dari referensi tidak ikut ditampilkan bila nama pemegang jabatan diganti, agar tidak dilekatkan pada orang yang berbeda.
9. **Jeda login:** kegagalan kelima mengunci akun selama satu menit. Kegagalan berikutnya setelah jeda memberi tiga menit, lalu sembilan, 27, dan seterusnya. Percobaan selama terkunci tidak menaikkan penghitung. Login benar setelah jeda mereset penghitung. Status tersimpan di database per akun, dengan transaksi dan row lock untuk menangani permintaan bersamaan.
10. **Transisi:** animasi masuk halaman dan transisi kontrol singkat; preferensi pengguna untuk mengurangi animasi dihormati.
11. **Copyright:** footer publik, login, dan dashboard memuat “© Dibuat oleh KKT 149 UNSRAT Pinaras” di sisi kanan, dengan layout yang tetap terbaca pada ponsel.
12. **Pengumuman:** drag and drop atau pemilih berkas dapat menambahkan sampai delapan lampiran sekaligus. Format yang didukung saat ini PDF (maksimal 10 MB), MP4/WEBM (maksimal 50 MB per berkas). Lampiran yang sudah ada bisa dipertahankan/dihapus saat edit. Server memeriksa kepemilikan intent unggahan dan hubungan lampiran dengan pengumuman. Lampiran draft tidak dapat dibuka publik; pengumuman lama dengan satu media tetap dapat dibaca.
13. **Sejarah:** kedua paragraf yang diberikan pengguna dimasukkan ke Profil Kelurahan. Provenance dicatat sebagai penuturan pengguna; tidak ada tahun atau fakta baru yang dikarang.
14. **Hydration:** elemen `title` di dalam segmen SVG grafik dihilangkan dari markup yang memicu masalah. Label aksesibel dan legenda tetap tersedia. Pengujian SSR/hydration dan browser pada dashboard berisi data tidak menemukan hydration error.

Gambar panorama yang digunakan login/dashboard/landing dioptimalkan dari 3.650.206 menjadi 546.366 byte, berkurang sekitar 85%. Gambar asli dipertahankan. Ini mengurangi transfer aset; bukan pengukuran waktu respons Production. Halaman yang memerlukan data tetap menghubungi server/database.

## File utama yang dibuat atau diubah

- Database: `prisma/schema.prisma`, `prisma/migrations/20261014000000_sipp_usability_security/migration.sql`, `prisma/seed-admin.ts`, `src/lib/admin-account.ts`, `scripts/apply-sipp-update.mjs`.
- Autentikasi: `src/lib/admin-login.ts`, `src/lib/auth.ts`, `src/lib/auth-errors.ts`, `src/components/login-form.tsx`, `src/app/login/page.tsx`.
- Layout/navigasi: `src/lib/dashboard-session.ts`, `src/components/dashboard-layout.tsx`, `src/components/dashboard-shell.tsx`, `src/components/page-loading.tsx`; layout/loading/template admin dan warga, template publik; halaman dashboard dipindahkan ke layout bersama; kontrol profil/pengaduan/notifikasi diperbarui.
- Struktur: `src/lib/organization.ts`, `src/lib/organization-store.ts`, `src/components/organization-chart.tsx`, `src/components/structure-editor.tsx`, `src/app/admin/konten/page.tsx`, `src/app/api/admin/cms/route.ts`, `src/app/api/struktur/[id]/photo/route.ts`.
- Pengaduan/foto: `src/lib/neighborhoods.ts`, `src/lib/image-files.ts`, `src/lib/upload-client.ts`, aturan unggahan, layanan/API pengaduan, formulir dan halaman detail privat, pemilih foto profil.
- Lampiran: `src/lib/announcement-files.ts`, `src/lib/announcement-attachments.ts`, `src/lib/save-announcement-attachments.ts`, komponen pengelolaan/tampilan, API pengumuman dan endpoint lampiran admin/publik, halaman detail.
- Tampilan/konten: `src/app/(public)/page.tsx`, `src/lib/cms.ts`, `src/lib/pinaras-information.ts`, header/footer, `src/components/donut-chart.tsx`, `src/app/globals.css`, manifest, `next.config.ts`, `public/images/panorama-pinaras.webp`.
- Dependensi: `package.json`/lockfile menambahkan `heic-to` untuk konversi; Playwright dan jsdom untuk verifikasi browser/hydration.
- Verifikasi: `scripts/verify-sipp-ui.mjs`; tes login, struktur/CMS, lingkungan/berkas, lampiran dan akses publik, serta regresi hydration grafik. Tes/mocks yang terdampak disesuaikan.
- Requirement: `docs/USER_REQUEST_2026_10_14.md`, Project Requirements, CMS Spec, Database Design, Security Requirements dan Acceptance Criteria mencatat perubahan serta konflik sumber luas wilayah.

Workspace sudah memiliki perubahan belum di-commit sebelum pekerjaan ini. Perubahan tersebut dipertahankan; daftar Git keseluruhan tidak boleh dianggap seluruhnya berasal dari tugas ini. Tidak dibuat commit atau perubahan konfigurasi environment/project link.

## Migrasi dan verifikasi database

Migrasi baru menambahkan `Complaint.neighborhood` dengan batas 1–8/null, tabel `AnnouncementAttachment`, dan tabel `AdminLoginThrottle`. Pergantian username berada dalam transaksi yang sama dan memiliki pemeriksaan benturan akun. Tidak ada penghapusan akun/pengaduan atau reset password.

- **Neon:** keenam migrasi terdahulu terverifikasi. Migrasi baru diterapkan menggunakan DIRECT_URL dari file Neon yang diparse terpisah. DATABASE_URL pooled dan DIRECT_URL direct telah dipastikan mengarah ke endpoint/database Neon yang sama, dengan database `neondb`. ID, role, password akun dan keberadaan skema baru terverifikasi setelahnya.
- **Lokal:** lima migrasi terdahulu terverifikasi; `20261010010000_persistent_upload_intents` yang sudah ada di workspace masih pending dan tabelnya belum ada. Prasyarat ini diterapkan bersama migrasi baru. Prasyarat menambah tabel UploadIntent dan menyelaraskan default SiteContent.updatedAt dengan schema, tanpa mengubah nilai data yang sudah ada. Verifikasi akun/skema setelahnya lulus.

Tidak ada seed, perubahan password, perubahan file environment, atau konfigurasi Neon/Vercel dalam pekerjaan ini. URL, kredensial, token dan hash tidak dicetak.

## Perintah dan hasil nyata

- `npm.cmd run db:generate` — berhasil menghasilkan Prisma Client sesuai schema.
- `npm.cmd run typecheck` — lulus.
- `npm.cmd run lint` — lulus.
- `npm.cmd test` — **230 tes lulus dalam 30 file**.
- `node scripts/verify-sipp-ui.mjs` — production build dan **32 pemeriksaan browser/integrasi lulus** pada database lokal sementara. Mencakup lima kegagalan bersamaan yang dihitung tepat sekali per percobaan, jeda 1/3/9 menit, login benar, layout 320–1440 px, struktur/edit CMS, larangan CMS warga, draft attachment 404, drag and drop dua PDF, navigasi yang mempertahankan dokumen, serta konversi berkas HEIC nyata menjadi preview JPEG. Database uji dihapus setelah pemeriksaan.
- `node scripts/apply-sipp-update.mjs --target local` dan `--target neon` — pemeriksaan target/akun/riwayat baca-saja lulus sebelum perubahan.
- `node scripts/apply-sipp-update.mjs --target local --apply` dan `--target neon --apply` — migrasi lulus; verifikasi ID/role/password dan skema baru lulus.
- `npm.cmd run build` — **build kode akhir berhasil**, termasuk kompilasi TypeScript dan pembuatan route. Tidak melakukan deployment.

Empat screenshot ditinjau: login ponsel, landing desktop/struktur, dashboard admin, dan formulir warga ponsel dengan preview HEIC. Artefak tersimpan pada folder Git-ignored `.ui-qa/sipp-improvements/`, bersama `report.json` tanpa kredensial.

## Batas hasil dan langkah berikutnya

Metadata `.vercel/project.json` tidak tersedia pada workspace saat pemeriksaan akhir. Target database yang benar-benar dipakai deployment Production masih belum terkonfirmasi melalui secret Vercel. Karena itu penerapan pada target Neon yang diverifikasi tidak dinyatakan sebagai bukti perubahan pada database deployment yang belum terverifikasi.

Kode akhir siap untuk ditinjau dan dideploy setelah proyek serta target database Production terverifikasi. Setelah deployment, periksa login dengan username baru dan password yang sudah dimiliki, CMS foto, pengaduan HEIC, lampiran pengumuman dan kecepatan navigasi pada domain Production. Tidak perlu reset password lagi.

Unggah/download Vercel Blob sungguhan belum diuji secara menyeluruh pada Production; pengujian browser lokal memverifikasi konversi/preview dan pemilihan file, sedangkan pemeriksaan server unggahan memakai tes terkontrol. Browser QA menggunakan Chromium; Safari/iOS dan layanan Google OAuth Production belum diuji ulang. Build/test lokal menggunakan Node v25.2.1, sementara target proyek adalah Node 24.x, sehingga build pada runtime deployment tetap perlu diverifikasi.

Rujukan implementasi: [panduan hydration Next.js](https://nextjs.org/docs/messages/react-hydration-error) dan [dokumentasi konverter heic-to](https://github.com/hoppergee/heic-to). Panduan Next.js yang terpasang di `node_modules/next/dist/docs/` juga dibaca sebelum perubahan layout/navigasi/gambar.

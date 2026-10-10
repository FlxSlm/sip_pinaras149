# SIPP UI/UX tahap 2 — implementasi dan verifikasi

Tanggal: 10 Oktober 2026.

Sebelas permintaan pengguna sudah diterapkan dalam kode, disertai redesign landing
dan pengumuman publik. Verifikasi otomatis dan HTTP berhasil, dengan pengecualian
dua error lint lama yang dijelaskan di bawah. Verifikasi interaksi dan tampilan
pada perangkat belum dilakukan karena sesi computer-use tidak menyediakan browser.

## Keputusan desain dan batas data

- Arial/Helvetica/sans-serif, ukuran dasar 17 px. Teks metadata lama dinaikkan ke
  skala yang lebih terbaca; kontrol utama tetap minimal sekitar 44 px.
- Gunakan warna, foto udara, dan identitas dari aset yang ada. Screenshot mockup
  tidak dipasang sebagai background halaman.
- Status tetap MENUNGGU, DIPROSES, SELESAI, DITOLAK. Prioritas NORMAL dan
  PERLU_PERHATIAN memakai diagram terpisah, karena mockup admin mencampur kedua
  dimensi tersebut.
- Angka, kategori informasi, dan alamat contoh pada mockup bukan sumber data.
  Landing memakai CMS dan data terbit aktual, serta mempertahankan provenance
  dan tahun statistik. Data yang belum tersedia diberi keadaan kosong.
- “Double verification” diterapkan sebagai tindakan awal lalu dialog konfirmasi.
  Metode autentikasi tetap Google untuk warga dan credentials untuk admin.

## Hasil untuk sebelas permintaan

1. **Font:** font familiar dan ukuran lebih besar diterapkan secara global.
   Judul, isi, metadata, tombol, dan tabel memiliki hierarki ukuran yang konsisten.
2. **Konfirmasi tindakan penting:** logout, pengiriman pengaduan, tindakan admin
   pada pengaduan, ganti/hapus foto, ganti password admin, simpan CMS, serta
   simpan/terbitkan/draft/hapus pengumuman meminta konfirmasi. Password admin
   memiliki input ulang password baru. Warga tidak memiliki UI password SIPP.
3. **Diagram:** dashboard warga dan admin memiliki pilihan Doughnut Chart,
   Pie Chart, atau Diagram Batang. Semua legenda menampilkan jumlah dan persen,
   termasuk Ditolak 0. Nilai nol tidak menghasilkan segmen berwarna di diagram.
   Bila total nol, diagram netral dan penjelasan kosong ditampilkan.
4. **Responsif:** grid dashboard memperhitungkan ruang di sebelah sidebar,
   chart dapat membungkus, tabel memiliki scroll internal, form dan profil
   memakai kolom adaptif, dialog dibatasi viewport, serta navigasi mobile memakai
   drawer. Belum diklaim lulus pada seluruh ukuran perangkat.
5. **Edit pengumuman:** tombol Edit membuka dialog dengan isi dan status saat ini.
   PDF/video dapat dipertahankan tanpa unggah ulang. Penyimpanan edit pengumuman
   terbit mempertahankan tanggal publikasinya. Publish dari draft mengirim
   notifikasi; edit pengumuman yang sudah terbit tidak mengirim ulang notifikasi.
6. **Foto profil:** gambar gagal dimuat memiliki fallback inisial. Upload melalui
   server mendukung penyimpanan lokal ketika token Blob tidak tersedia dan Blob
   privat ketika token tersedia. Tombol hapus hanya untuk foto unggahan SIPP.
   Foto privat tetap diambil lewat endpoint sesi pengguna.
7. **Perbesar bukti:** thumbnail pada detail pengaduan admin/warga membuka dialog
   ukuran besar, dengan navigasi antar foto dan tautan ukuran asli. Endpoint
   bukti yang memeriksa role dan ownership tetap dipakai.
8. **Drag and drop:** drop dan picker memakai state/validasi yang sama, dengan
   highlight zona drop, thumbnail, nama/ukuran file, dan hapus pilihan.
   FormData berisi file terpilih secara eksplisit. Picker kosong tidak lagi
   mengirim file opsional berukuran nol.
9. **Kerapatan halaman:** landing, pengumuman, pengelolaan pengumuman, profil,
   form pengaduan, daftar/detail pengaduan, dan susunan dashboard dirapikan.
   Ruang tambahan diisi informasi atau aksi relevan, bukan data contoh.
10. **Pengumuman publik:** susunan daftar mengikuti DESAIN PENGUMUMAN.png,
    dengan pencarian, filter jenis media aktual, pagination, sidebar informasi,
    detail dengan lebar baca, serta navbar/footer bersama. Thumbnail PDF
    merender halaman pertama, video memakai frame video, teks memakai stiker
    ikon pengumuman. Kegagalan media memiliki fallback. Revision berdasarkan
    updatedAt memuat ulang thumbnail setelah lampiran diedit.
11. **Detail admin:** /admin/pengumuman/[id] menampilkan teks/lampiran termasuk
    draft dan arsip di dalam dashboard. Media draft memiliki endpoint khusus
    admin; akses publik tetap hanya untuk pengumuman PUBLISHED.

## Landing dan jalur publik

Halaman /, /pengumuman, /pengumuman/[slug], /pengaduan,
/pengaduan/[ticketNumber], dan /offline dipindahkan ke route group (public).
URL pengguna tidak berubah. Layout bersama menyediakan header dan footer.

Landing menampilkan hero/profil CMS, statistik dengan sumber/tahun, layanan,
pengumuman terbit, potensi/fasilitas terbit, proyeksi pengaduan publik yang aman,
galeri terbit, dan kontak/lokasi aktual. Query statistik/potensi/fasilitas tidak
mengganti daftar CMS kosong dengan daftar contoh. Halaman pengaduan publik tetap
menggunakan DTO sanitasi untuk SELESAI/DITOLAK.

Endpoint galeri hanya menyediakan gambar terbit yang disimpan dalam public/images
atau storage/gallery. Storage key tidak dikirim sebagai URL ke halaman publik.
Dukungan penyedia galeri lain belum ditambahkan.

Service worker tidak menyimpan halaman admin/login maupun permintaan RSC.
Endpoint API/media privat tetap tidak masuk cache statis.

## File dibuat/diubah dalam tahap ini

Tipografi dan navigasi:
- src/app/globals.css
- src/app/(public)/layout.tsx
- src/app/(public)/page.tsx
- src/app/(public)/pengumuman/page.tsx
- src/app/(public)/pengumuman/[slug]/page.tsx
- src/app/(public)/pengaduan/page.tsx
- src/app/(public)/pengaduan/[ticketNumber]/page.tsx
- src/app/(public)/offline/page.tsx
- src/components/public-header.tsx
- src/components/public-footer.tsx
- src/components/ui/dialog.tsx

Dashboard, pengaduan, dan konfirmasi:
- src/app/admin/page.tsx
- src/app/warga/page.tsx
- src/app/admin/pengaduan/page.tsx
- src/app/admin/pengaduan/[ticketNumber]/page.tsx
- src/app/warga/pengaduan/page.tsx
- src/app/warga/pengaduan/buat/page.tsx
- src/app/warga/pengaduan/[ticketNumber]/page.tsx
- src/components/donut-chart.tsx
- src/lib/chart-data.ts
- src/components/complaint-form.tsx
- src/lib/evidence-files.ts
- src/components/evidence-gallery.tsx
- src/components/admin-complaint-actions.tsx
- src/components/admin-password-form.tsx
- src/components/cms-editor.tsx

Profil:
- src/app/admin/profil/page.tsx
- src/app/warga/profil/page.tsx
- src/components/dashboard-shell.tsx
- src/components/avatar.tsx
- src/components/profile-photo-form.tsx
- src/lib/image-upload.ts
- src/app/api/profile/photo/route.ts
- src/app/api/me/route.ts

Pengumuman dan CMS:
- src/app/admin/pengumuman/page.tsx
- src/app/admin/pengumuman/[id]/page.tsx
- src/components/announcement-manager.tsx
- src/components/announcement-card.tsx
- src/components/announcement-list.tsx
- src/components/announcement-thumbnail.tsx
- src/components/announcement-content.tsx
- src/lib/announcements.ts
- src/lib/announcement-media.ts
- src/app/api/admin/pengumuman/route.ts
- src/app/api/admin/pengumuman/[id]/media/route.ts
- src/app/api/pengumuman/[slug]/media/route.ts
- src/app/api/galeri/[id]/route.ts
- src/lib/cms.ts

Dependensi, PWA, diagnostik, dan dokumentasi:
- package.json dan package-lock.json: pdfjs-dist serta predev/prebuild
- scripts/prepare-pdf-worker.mjs
- scripts/pdf-preview-smoke.mjs
- scripts/ui-smoke.ts
- public/sw.js
- eslint.config.mjs: hanya mengabaikan vendor PDF.js hasil salinan dependency
- .gitignore: hasil generate PDF.js, storage privat, dan artefak QA lokal
- docs/DESIGN_IMPLEMENTATION_MAP.md
- docs/UI_REDESIGN_STAGE_2.md

File di luar daftar yang sudah berubah pada working tree dari pekerjaan sebelumnya
atau milik pengguna dipertahankan. File referensi DESAIN PENGUMUMAN.png dipakai
sebagai acuan; tidak disisipkan sebagai tampilan runtime.

## Migration dan data

Tidak ada perubahan schema atau migration baru pada tahap UI ini.
Tidak menjalankan seed, reset database, atau mengedit record produksi untuk QA.
Migration customImage dari perbaikan autentikasi sebelumnya tetap terpisah;
lihat docs/AUTH_FIX_REPORT.md.

## Tes ditambahkan

- src/lib/ui-workflows.test.ts: partisi chart/nilai nol, opsi chart, validasi
  file/drop/picker, byte ranges, DTO pengumuman tanpa storage key, revision
  thumbnail, dan avatar langsung tanpa optimizer.
- src/app/api/admin/pengumuman/route.test.ts: edit tanpa reupload, perubahan tipe
  media, tanggal terbit, otorisasi, DTO admin, dan notifikasi publish.
- src/lib/announcement-access.test.ts: media publik terbit, draft tersembunyi,
  endpoint admin menolak guest/warga sebelum query, dan akses media admin.
- src/app/api/profile/photo/local-upload.test.ts: upload lokal dan Blob privat,
  signature gambar, penolakan guest, serta GET/DELETE foto milik sendiri.

Upload, penghapusan, dan perubahan pengumuman pada tes menggunakan mock.
Pengujian HTTP memakai login nyata dan membaca data yang sudah ada.

## Perintah dan hasil aktual

- npm.cmd test: **164 tes lulus dalam 19 file**.
- npm.cmd run typecheck: **lulus**.
- npm.cmd exec -- eslint src scripts public/sw.js eslint.config.mjs: **lulus**.
- npm.cmd run lint: **belum lulus**, tepat dua error lama
  @typescript-eslint/no-require-imports pada check_checksum.js baris 1–2,
  tanpa warning. File tersebut tidak diubah dan aturan lint tidak dilonggarkan.
- npm.cmd run build: **lulus**, termasuk route detail admin dan media baru.
- npm.cmd exec -- tsx scripts/ui-smoke.ts: **lulus**. /, /pengumuman,
  /pengaduan, /offline HTTP 200 dengan header/footer bersama; login admin
  berhasil; dashboard, pengumuman, profil, dan CMS admin HTTP 200.
  Detail pengumuman terbit dan detail admin HTTP 200. Draft dapat dibaca admin
  dan menghasilkan notFound untuk publik. Next streaming mengirim HTTP 200
  pada halaman draft tersebut dengan marker fallback 404; tidak dilaporkan
  sebagai HTTP 404 biasa.
- node scripts/pdf-preview-smoke.mjs: **lulus**. PDF sintetis dua halaman
  merender hanya halaman pertama ke PNG 480 × 360. Gambar juga diperiksa
  langsung dan berisi “HALAMAN PERTAMA”. Ini pengujian renderer Node,
  bukan screenshot thumbnail browser.
- git diff --check: **lulus**, tanpa kesalahan whitespace.
- Inspeksi gambar referensi: DASHBOARD WARGA.png, DASHBOARD ADMIN.png,
  DESAIN PENGUMUMAN.png, serta panorama-pinaras.png.
- Inventaris computer-use: tidak ada browser/app yang tersedia.

PDF.js worker, cMap, standard fonts, dan wasm berasal dari dependency lokal,
disiapkan otomatis sebelum dev/build. Tidak memakai CDN untuk membaca PDF.
Implementasi mengikuti contoh resmi Mozilla PDF.js:
https://github.com/mozilla/pdf.js/blob/master/examples/learning/helloworld.html

## Batas verifikasi dan risiko yang masih terbuka

- Belum ada screenshot atau uji interaksi browser pada 360, 390, 768, 1024,
  dan 1440 px. Drop file, pilihan chart, fokus/Escape pada dialog bertingkat,
  frame thumbnail video, serta PDF worker dalam browser perlu diperiksa
  ketika browser tersedia. Tidak ada klaim semua ukuran perangkat telah lulus.
- Foto admin saat pemeriksaan belum memiliki customImage; image bawaan masih
  terisi, token Blob belum ada. Endpoint foto kustom mengembalikan 404 secara
  wajar. Fallback menghindari ikon gambar rusak; foto akun tidak diganti untuk QA.
  next.config sudah menonaktifkan optimizer sebelum perubahan ini, sehingga
  dugaan awal optimizer sebagai penyebab utama pada screenshot tidak terbukti.
- Storage lokal memerlukan direktori writable dan persisten. Pada deployment
  yang filesystem-nya sementara, gunakan Blob privat untuk foto dan storage
  persisten untuk lampiran pengumuman/bukti yang sudah memakai storage lokal.
- PDF/video besar dirender atau diambil sesuai media aktual. Format rusak,
  codec yang tidak didukung browser, atau media hilang memakai fallback,
  bukan thumbnail palsu.
- npm install melaporkan 24 temuan audit pada dependency tree. Audit keamanan
  menyeluruh dan perubahan dependency di luar kebutuhan PDF tidak dilakukan.
  Tidak menjalankan npm audit fix secara otomatis.

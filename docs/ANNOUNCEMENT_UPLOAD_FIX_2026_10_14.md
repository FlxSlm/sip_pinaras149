# Perbaikan unggahan pengumuman

## Penyebab

Screenshot berasal dari localhost. Parser `.env.local` menunjukkan token Blob belum tersedia dan target database localhost. Alur sebelumnya hanya mendukung unggahan baru ke Vercel Blob, sehingga `/api/uploads` mengembalikan 503 “Penyimpanan lampiran belum dikonfigurasi.” sebelum berkas video dikirim.

## Perubahan

- Development dengan PostgreSQL loopback kini dapat memakai penyimpanan privat lokal ketika token Blob tidak ada. Pemilihan backend dilakukan server berdasarkan environment aktual; tidak mengambil konfigurasi Neon sebagai fallback. Host yang diganti lewat parameter URL juga diperiksa.
- Endpoint lokal tidak aktif pada Production, Vercel, atau database nonlocalhost. Jika Blob dikonfigurasi, unggahan baru tetap memakai Blob; berkas development lama dapat tetap dibaca di localhost.
- Berkas disimpan di `storage/uploads/`, bukan public, dan folder tersebut sudah diabaikan Git. Browser mendapat upload URL untuk intent miliknya, bukan path filesystem.
- Server memeriksa autentikasi, role, pemilik intent, masa berlaku, konsumsi intent, MIME, ekstensi, ukuran dan signature. Isi di-stream ke staging dengan batas ukuran, lalu diterbitkan atomik tanpa menimpa berkas sebelumnya. Berkas gagal dibersihkan.
- Simpan pengumuman tetap mengonsumsi intent secara atomik bersama resource, sehingga berkas tidak dapat dipakai ulang/diambil dari pengguna lain. Pembacaan melalui API tetap memeriksa akses admin atau status PUBLISHED. Video mendukung HTTP Range untuk playback/seeking.
- Video MP4/WEBM maksimal 50 MB dan PDF maksimal 10 MB per berkas; sampai delapan lampiran dapat disimpan dalam satu pengumuman.
- Filter pengumuman admin kini hanya **Semua, Terbit, Draft**. Editor/API hanya menerima status baru DRAFT/PUBLISHED. Record ARCHIVED historis ditampilkan sebagai Draft pada admin tanpa perubahan database saat dibaca. Enum lama tidak dihapus dan tidak diperlukan migrasi.

Tidak ada token yang dibuat/dicetak, perubahan file environment, reset password, perubahan akun, seed, migrasi database asli, deployment, atau konfigurasi Vercel/Neon.

## File utama

- Baru: `src/lib/local-upload-storage.ts`, `src/app/api/uploads/[id]/local/route.ts`, tes terkait, `scripts/verify-local-announcement-upload.mjs`, laporan ini.
- Berubah: API pembentukan intent, klien unggahan, validasi/penyiapan intent, reader media lokal/Blob, reader foto struktur, manager/API/detail pengumuman serta tes terkait.
- Dokumentasi Security Requirements, CMS Spec, Database Design, User Request dan Vercel Deployment mencatat pengecualian development serta penghapusan pilihan Arsip.
- ESLint mengabaikan salinan kode/bundle sementara `.ui-qa` dan `.deployment-qa`, agar pengujian browser tidak ikut diperlakukan sebagai kode aplikasi.

## Verifikasi

`node scripts/verify-local-announcement-upload.mjs` lulus **11 pemeriksaan integrasi/browser nyata**. Pengujian memakai salinan kode terpisah, database localhost sementara, akun sintetis, dan berkas sintetis; salinan, berkas dan database dihapus setelah selesai. Hasil aman tersimpan di `.ui-qa/local-upload/report.json`.

- Filter hanya tiga opsi.
- Video WebM yang direkam dari canvas pengujian dan PDF berhasil disimpan bersama melalui formulir admin.
- Admin dapat membaca video; guest ditolak pada endpoint admin.
- Video draft tidak tersedia publik; menjadi tersedia setelah publish dan kembali tertutup setelah unpublish.
- HTTP Range menghasilkan 206 dengan panjang byte yang benar.
- Browser berhasil membaca metadata video WebM nyata.
- Unggahan MP4 sintetis 12 MB berhasil, dan intent yang sama tidak dapat menimpa berkas yang sudah diunggah. Fixture besar memeriksa transfer/batas ukuran, bukan kualitas atau playback MP4.

`npm.cmd run build`, lint dan typecheck berhasil. **260 tes lulus dalam 32 file.** Pemeriksaan akhir dilakukan setelah build agar pembentukan tipe route Next.js tidak berbenturan dengan pemeriksaan tipe. Unit test mencakup gate Production/Neon/Vercel, URL host override, traversal path, signature/ukuran palsu, kepemilikan/expiry/replay, dan status Arsip yang ditolak.

## Penggunaan

Jalankan development dengan `npm.cmd run dev` dan buka localhost. Tidak perlu menambahkan token untuk pengujian lokal dengan database localhost.

Untuk deployment Vercel/Production, tetap diperlukan store Blob **Private** dan `BLOB_READ_WRITE_TOKEN` yang benar. Perubahan ini tidak mengonfigurasi store cloud atau membuktikan unggahan Production berhasil. Berkas lokal tidak menjadi berkas Production secara otomatis.

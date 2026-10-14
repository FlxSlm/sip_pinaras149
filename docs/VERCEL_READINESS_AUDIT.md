# Audit kesiapan Vercel — 10 Oktober 2026
Audit kode/DB aktual, bukan pengulangan laporan UI.
## Blocker terverifikasi
- Upload pengaduan dan pengumuman menulis storage lokal. Foto profil fallback lokal tanpa Blob. Tidak persisten di Vercel.
- Multipart melalui API memuat foto 5 MB, PDF 10 MB, video 50 MB; melampaui batas request Vercel Functions 4,5 MB.
- Seed umum mengubah ulang CMS dan menambahkan warga contoh; tidak tepat sebagai bootstrap production.
- prisma.config.ts dan runtime memiliki fallback kredensial localhost; belum memisahkan koneksi CLI langsung dari pool runtime.
- Node host 25.2.1, target package 24.x. Node 24.21.0 sudah tersedia untuk verifikasi terisolasi.
- Tidak ada vercel.json/link proyek Vercel di repository. Env example belum mencakup Blob atau prosedur Preview terisolasi.
- Lint check_checksum.js memakai require di luar konvensi ESLint.
## Migrasi dan autentikasi aktual
- Database saat ini: User.customImage ada, admin.pinaras role/hash valid dan cocok dengan password env tanpa mencetak nilainya.
- Riwayat: satu percobaan V2 rolled back dengan checksum lama; percobaan aktif sukses cocok dengan file. Tidak ada operasi terhadap tabel riwayat.
- Lima migrasi berhasil pada database localhost baru terisolasi, deploy kedua idempotent. Semua checksum baru cocok.
- Schema diff pada DB audit menemukan default SiteContent.updatedAt berbeda. Perlu migration tambahan untuk menyamakan schema.
- Dua account Google tersimpan dengan role WARGA. Google credentials tersedia lokal. Ini bukan bukti consent/code exchange Google berhasil.
- Migration V2 lama menghapus field/accounts legacy. Keberhasilan dari DB kosong tidak membuktikan upgrade V1 berisi data aman. File lama tidak diedit.
## Rencana perubahan
1. Konfigurasi DB/Prisma/Vercel, env preflight, Node 24, seed admin khusus non-overwrite.
2. Upload langsung browser ke Blob privat, token per pathname acak dan intent terikat user/jenis/ukuran/expiry di DB; validasi header dan signature server sebelum referensi disimpan.
3. Konsumsi intent atomik dengan resource; stream download lewat endpoint yang sudah memeriksa role/ownership/PUBLISHED, termasuk Range video/PDF.
4. Migrasi tambahan additive UploadIntent dan koreksi default SiteContent; uji ulang seluruh chain pada DB kosong baru.
5. Script migrasi file legacy default dry-run, tanpa operasi production dalam sesi.
6. Tes regresi, validate/typecheck/lint/build Node 24, tes login HTTP dan adapter Google, panduan manual layanan eksternal.

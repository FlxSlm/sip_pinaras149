# Perbaikan pesan tindakan dan pemilih foto struktur

- Kartu Tindakan menampilkan **Pengaduan ini sudah selesai.** hanya untuk SELESAI, dan **Pengaduan ini telah ditolak.** hanya untuk DITOLAK. Pesan gabungan yang ambigu dihapus. Aturan status dan izin tindakan tidak berubah.
- Pemilih foto CMS memakai tombol biru **Pilih Foto** dengan ikon unggahan, keterangan format/batas 5 MB, serta nama berkas terpilih. Kontrol native disembunyikan sehingga bahasa tombol tidak bergantung pada bahasa browser. Tombol membuka pemilih berkas dan tidak melakukan submit form.
- Klien unggahan memvalidasi ID dan respons backend sebelum mengunggah. Respons lokal memakai URL intent lokal; respons Blob wajib mempunyai pathname dan scoped token. Respons yang tidak lengkap ditolak dengan pesan Indonesia sebelum memanggil SDK. Detail error SDK tidak diteruskan ke tampilan pengguna.
- Screenshot error `Vercel Blob: pathname is required` menunjukkan panggilan SDK tanpa pathname. Kode sekarang mencegah panggilan tersebut untuk respons tidak lengkap dan memisahkan unggahan lokal dari Blob. Penyebab runtime pada tab pengguna, termasuk kemungkinan kode browser yang belum diperbarui, tidak dinyatakan terkonfirmasi hanya dari screenshot.

File berubah: `src/components/admin-complaint-actions.tsx`, `src/components/structure-editor.tsx`, `src/lib/upload-client.ts`, skrip browser `scripts/verify-local-announcement-upload.mjs`. Ditambahkan `src/lib/upload-client.test.ts` dan laporan ini.

`npm.cmd run lint`, `npm.cmd run typecheck`, dan `npm.cmd run build` lulus; `npm.cmd test` menghasilkan **268 tes lulus dalam 33 file**. Pengujian klien meliputi unggahan foto struktur lokal tanpa memanggil Blob, pathname/token Blob yang valid, penolakan respons tidak lengkap, dan sanitasi error SDK.

`node scripts/verify-local-announcement-upload.mjs` lulus **16 pemeriksaan browser/integrasi**. Pemeriksaan tambahan memverifikasi pesan spesifik untuk SELESAI dan DITOLAK, tidak tersedianya tindakan penyelesaian/penolakan pada pengaduan tertutup, tombol Indonesia yang membuka file chooser, penyimpanan foto struktur, dan pembacaan gambar yang tersimpan melalui proyeksi publik. Hasil tersimpan pada `.ui-qa/local-upload/report.json`; pengujian memakai salinan kode, akun sintetis, dan database localhost sementara yang dibersihkan setelahnya. Jalur Blob diperiksa dengan mock SDK; tidak ada klaim roundtrip Blob Production.

Tidak ada migrasi, perubahan data akun/pengaduan/CMS asli, reset password, seed, deployment, atau perubahan environment. Pengujian database yang menulis hanya memakai database sementara milik skrip uji.

Muat ulang halaman untuk mengambil kode klien terbaru. Jika tab masih memperlihatkan kontrol/error lama, gunakan Ctrl+Shift+R. Hasil pengujian lokal bukan verifikasi deployment Production.

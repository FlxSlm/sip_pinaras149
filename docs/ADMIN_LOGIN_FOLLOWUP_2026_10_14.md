# Pemeriksaan lanjutan login admin

## Temuan dan perubahan

Teks username samar di screenshot berasal dari `placeholder={ADMIN_USERNAME}` yang sebelumnya ditambahkan pada formulir. Nilai input awal sebenarnya kosong. Placeholder kini **Username admin**, dengan label aksesibel untuk username dan password, sehingga halaman publik tidak menampilkan username akun nyata.

Sebelumnya server hanya mengirim penolakan generik untuk kegagalan pertama sampai keempat; frontend tidak mendapat sisa percobaan. Sekarang transaksi pembatasan login mengembalikan sisa percobaan berdasarkan status database. Hasil kegagalan dikirim melalui kode error terkontrol dan dipetakan kembali menjadi pesan umum, disertai **Sisa percobaan sebelum jeda: 4/3/2/1**. Pada kegagalan kelima tampil nol dan hitung mundur. Setelah jeda, formulir menjelaskan bahwa satu percobaan berikutnya tersedia dan kegagalan memperpanjang jeda. Batas tetap ditegakkan server, termasuk ketika username diganti atau halaman dimuat ulang. Formulir awal menjelaskan aturan lima kegagalan; tidak mengklaim penghitung akun yang belum diperiksa oleh server.

## Pemeriksaan baca-saja database

Pemeriksaan menggunakan parser `dotenv.parse` secara terpisah, URL eksplisit dari setiap file, dan Prisma 7 dengan PrismaPg. Tidak menggunakan fallback atau menjalankan autentikasi yang menaikkan penghitung.

- PostgreSQL lokal: koneksi berhasil; username baru ditemukan; role ADMIN_KELURAHAN; format hash sesuai aplikasi; dua kegagalan tercatat, belum terkunci. Saat pemeriksaan terdapat tiga percobaan sebelum jeda.
- Neon: koneksi berhasil; username baru ditemukan; role ADMIN_KELURAHAN; format hash sesuai aplikasi; nol kegagalan tercatat, belum terkunci.
- Hash tersimpan pada kedua target berbeda. Ini **tidak membuktikan password plaintext berbeda**, karena hashing memakai salt acak. Kedua akun memiliki kredensial yang dikelola terpisah, dan reset yang sebelumnya disiapkan hanya untuk Neon tidak menyamakan password lokal.

Screenshot menunjukkan localhost:3000. Konfigurasi `.env.local` yang diperiksa mengarah ke PostgreSQL lokal. Jika proses dev dijalankan dengan DATABASE_URL yang diberikan dari luar, nilainya dapat berbeda; pemeriksaan file ini bukan pembacaan environment proses dev yang sudah berjalan.

Tidak ada password yang dimasukkan atau ditebak oleh agent, sehingga kecocokan password yang dicoba pengguna **belum terverifikasi**. Penggantian username sebelumnya mempertahankan hash pada masing-masing akun; autentikasi tetap memverifikasi password persis seperti yang dimasukkan, termasuk spasi. Tidak ada reset atau penyamaan password dalam pemeriksaan lanjutan ini.

## Pemeriksaan aman oleh pengguna

Jalankan dari workspace pada terminal PowerShell:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-admin-password.ps1
```

Password dimasukkan lewat Read-Host -AsSecureString, tidak lewat chat, command argument, atau environment variable. PowerShell melewatkannya sekali melalui stdin dalam JSON yang mempertahankan karakter dan spasi. Buffer unmanaged SecureString dibersihkan dan referensi sementara dilepas setelah digunakan; proses Node berakhir setelah pemeriksaan. Skrip hanya mencari akun, membaca status, dan memanggil fungsi verifyPassword aplikasi. Tidak memperbarui password maupun penghitung kegagalan. Hasil terminal hanya menunjukkan cocok/tidak cocok/tidak dapat diperiksa pada target lokal dan Neon, atau kegagalan pemeriksaan yang disanitasi.

`scripts/check-admin-login.mjs` juga dapat dijalankan tanpa flag untuk pemeriksaan baca-saja akun/status, tanpa memasukkan password. Tidak ada URL, hostname, username koneksi, password, hash atau token yang dicetak.

## File dan verifikasi

Perubahan dibatasi pada formulir/halaman login, parser error autentikasi, hasil pembatasan login, handler authorize, serta tes terkait. Skrip browser diperbarui untuk placeholder netral dan penghitung server. Ditambahkan dua skrip pemeriksaan baca-saja dan laporan ini. Tidak ada migrasi, seed, deployment atau perubahan environment/database akun asli.

Lint dan typecheck lulus; 235 tes lulus dalam 30 file. Syntax kedua skrip Node dan PowerShell terverifikasi, termasuk round trip encoding karakter non-ASCII dan spasi. Build produksi dan 37 pemeriksaan browser/integrasi lulus, termasuk placeholder tanpa username asli dan tampilan sisa 4/3/2/1 percobaan dari server. Hasil tercatat di `.ui-qa/sipp-improvements/report.json` dan menggunakan database lokal sementara yang dihapus setelah pengujian, tanpa menyentuh akun asli.

Perbaikan tampilan/penghitung dapat diverifikasi terpisah dari password asli. Keberhasilan login akun pengguna belum dinyatakan selesai sebelum pemeriksaan password dan login pada proses yang digunakan berhasil.

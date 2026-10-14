# Perubahan SIPP — 14 Oktober 2026

Arahan pengguna pada tanggal ini menggantikan bagian requirement V2 yang bertentangan:

- Nama produk hanya **SIPP**; kredensial admin menggunakan username `kkt149unsrat@pinaras.com` (tetap username aplikasi, bukan Google OAuth).
- CMS hanya mengelola struktur kelurahan: nama pejabat dan foto. Data/fitur pembacaan konten lama tidak dihapus.
- Bagan organisasi mengikuti gambar yang diberikan pengguna. Jabatan tanpa nama tetap kosong. Tidak ada tanggal sumber gambar yang diberikan.
- Narasi asal-usul Pinaras berasal dari penuturan yang diberikan pengguna, bukan klaim sejarah resmi terverifikasi.
- Luas tampilan menjadi **3,96 km²** berdasarkan pembaruan pengguna. Sumber BPS 2020 yang mencatat 3,98 km² tetap disimpan; angka pembaruan tidak diatribusikan ke BPS.
- Pengaduan mempunyai pilihan Lingkungan 1–8 atau Tidak Tahu. Null pada data lama tetap berarti tidak diketahui.
- Gagal login admin lima kali memicu jeda 1 menit, kemudian 3, 9, 27 menit, dan seterusnya setelah setiap kegagalan yang diizinkan. Percobaan saat terkunci tidak meningkatkan penghitung. Login benar setelah jeda mereset penghitung.
- Lampiran pengumuman dapat lebih dari satu, dengan validasi dan boundary draft/public tetap berlaku.
- Perbaikan lanjutan: development dengan database localhost dapat menyimpan unggahan privat lokal ketika Blob belum dikonfigurasi; deployment tetap membutuhkan Blob privat. Filter admin hanya Semua/Terbit/Draft dan status baru hanya DRAFT/PUBLISHED. ARCHIVED historis dipertahankan pada database, dengan proyeksi Draft pada tampilan admin.

Migrasi baru bersifat aditif, mempertahankan data lama dan password admin. Penggantian username berhenti jika terjadi konflik; tidak ada penggabungan atau penghapusan akun.

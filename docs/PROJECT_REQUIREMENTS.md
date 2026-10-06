# SIPP V2 — Project Requirements

## 1. Ringkasan
SIPP (Sistem Informasi Peduli Pinaras) adalah portal digital Kelurahan Pinaras, Kecamatan Tomohon Selatan, Kota Tomohon. SIPP menggabungkan portal informasi publik kelurahan, CMS konten, pengumuman, dan sistem pengaduan warga.

## 2. Pengguna
Hanya ada dua role terautentikasi:
- `WARGA`
- `ADMIN_KELURAHAN`

`PUBLIC/GUEST` bukan role database. Pengunjung dapat membuka landing page tanpa login.

## 3. Authentication
### Warga
- Login menggunakan Google OAuth.
- Google login diperlukan ketika warga ingin membuat pengaduan dan menggunakan dashboard personal.
- Tidak ada Facebook OAuth.
- Tidak ada registrasi username/password warga.
- Warga tidak memiliki password SIPP.
- Warga dapat mengelola foto profil dan data profil yang diizinkan.
- Jangan menyediakan UI ganti password untuk warga karena password dikelola Google.

### Admin Kelurahan
- Tidak menggunakan Google OAuth.
- Tidak ada self-registration.
- Akun dibuat/di-seed developer melalui code/database.
- Login menggunakan credential aplikasi.
- Admin dapat mengganti password.

## 4. Landing Page Publik
Landing page dapat diakses tanpa login dan memuat informasi Kelurahan Pinaras secara menyeluruh, ringkas, dan nyaman dibaca.

Konten harus dinamis dan dapat dikelola Admin Kelurahan:
- hero/banner
- profil/deskripsi
- sejarah, jika data resmi tersedia
- visi dan misi, jika data resmi tersedia
- statistik
- geografis/demografi
- potensi kelurahan
- fasilitas
- galeri
- pengumuman
- lokasi/peta
- kontak resmi
- CTA pengaduan

Konten utama tidak boleh di-hard-code di JSX/TSX bila seharusnya dikelola melalui CMS.

## 5. Pengaduan
Warga yang telah login dapat membuat pengaduan.

Minimal data:
- nomor tiket
- pemilik/pelapor
- kategori
- judul
- deskripsi
- lokasi kejadian
- bukti/lampiran bila ada
- timestamp
- status penanganan
- priority
- catatan/tanggapan admin
- audit log

### Status
- `MENUNGGU`
- `DIPROSES`
- `SELESAI`
- `DITOLAK`

`MENUNGGU` berarti pengaduan belum dibuka dan belum mendapat respons awal dari admin.

### Priority
- `NORMAL`
- `PERLU_PERHATIAN`

Priority bukan status. Priority wajib ditentukan admin saat pengaduan pertama kali dibuka.

### Transisi utama
- `MENUNGGU -> DIPROSES`
- `MENUNGGU -> SELESAI`
- `MENUNGGU -> DITOLAK`
- `DIPROSES -> SELESAI`

Jangan menambah transisi lain tanpa keputusan produk.

### Kelompok daftar
Pengaduan Yang Perlu Ditindaklanjuti:
- `MENUNGGU`
- `DIPROSES`

Pengaduan Yang Sudah Selesai:
- `SELESAI`
- `DITOLAK`

## 6. Dashboard Warga
Sidebar:
- Riwayat Pengaduan
- Profil

Header:
- lonceng notifikasi

Dashboard juga memiliki diagram statistik pengaduan:
- Selesai
- Diproses
- Menunggu
- Ditolak

Riwayat:
- hanya pengaduan milik user tersebut
- tampilan seperti inbox/email
- item berisi ringkasan
- klik item -> detail

Notifikasi minimal:
- pengumuman yang relevan
- perubahan status
- balasan/catatan admin
- aktivitas personal lain yang relevan

Lonceng menuju halaman seluruh notifikasi warga.

## 7. Dashboard Admin
Menu:
- Dashboard
- Pengaduan
- Pengumuman
- Konten Kelurahan
- Profil

Header:
- notifikasi

Dashboard:
- ringkasan pengaduan
- diagram status: Selesai / Dalam Proses / Ditolak
- diagram priority: Normal / Perlu Perhatian

Pengaduan:
- queue tindak lanjut
- queue selesai
- detail
- respons/catatan
- status
- priority

Pengumuman:
- catatan/teks
- PDF
- video
- draft/publish/unpublish
- tampil di landing page jika dipublikasikan

Konten Kelurahan:
- edit teks
- kelola statistik
- kelola potensi
- kelola fasilitas
- kelola galeri/media
- kelola hero
- kelola kontak/lokasi

Profil admin:
- foto profil
- data profil
- ganti password

## 8. Public Privacy
Data pengaduan internal bukan otomatis informasi publik. Hanya data yang secara eksplisit dipublikasikan dan sudah disanitasi yang boleh ditampilkan pada area publik.

## 9. PWA
- responsive/mobile-first
- web app manifest
- installability
- offline fallback aman
- jangan cache response privat secara tidak aman

## 10. Non-goals
- role Kepala Lingkungan terpisah
- role Lurah terpisah
- Facebook login
- self-registration warga
- self-registration admin
- NIK
- workflow Kecamatan/Camat
- pembayaran
- chat internal
- GIS kompleks, kecuali peta lokasi yang memang diperlukan

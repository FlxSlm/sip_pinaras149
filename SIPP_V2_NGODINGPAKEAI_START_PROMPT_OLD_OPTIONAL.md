# SIPP V2 — Starter Prompt untuk NgodingPakeAI

Gunakan prompt ini pada project baru NgodingPakeAI untuk tahap Plan/PRD. Jangan meminta source code pada tahap ini.

Saya ingin membangun ulang aplikasi PWA bernama **SIPP (Sistem Informasi Peduli Pinaras)** untuk Kelurahan Pinaras, Kecamatan Tomohon Selatan, Kota Tomohon.

## Tujuan Produk
SIPP adalah portal digital Kelurahan Pinaras yang:
1. menjadi landing page/profil resmi kelurahan yang dapat diakses publik tanpa login;
2. menyediakan pengaduan warga yang terhubung langsung dengan Admin Kelurahan;
3. menyediakan pengumuman dan konten profil yang dikelola dinamis oleh Admin;
4. menyediakan dashboard pribadi bagi warga;
5. menyediakan dashboard operasional bagi Admin Kelurahan;
6. tersedia sebagai PWA yang responsif dan profesional.

## Role dan Akses
Hanya ada dua role database:
- `WARGA`
- `ADMIN_KELURAHAN`

Guest/public adalah pengunjung yang belum login, bukan role database.

### Warga
- Login hanya menggunakan Google OAuth.
- Tidak ada Facebook OAuth.
- Tidak ada registrasi username/password.
- Tidak memiliki password SIPP yang dapat diganti.
- Dapat mengunggah foto profil.
- Pengaduan hanya dapat dibuat setelah login.
- Hanya dapat melihat data/pengaduan miliknya sendiri.

### Admin Kelurahan
- Tidak menggunakan Google OAuth.
- Tidak ada self-registration.
- Akun dibuat/di-seed oleh developer melalui code/database.
- Login menggunakan credential aplikasi.
- Dapat mengganti password dan foto profil.
- Memiliki akses operasional untuk seluruh data yang memang menjadi kewenangan admin.

## Landing Page
Landing page bisa dibuka tanpa login dan bersifat dinamis.

Konten yang harus dapat dikelola Admin:
- hero/banner;
- deskripsi Kelurahan Pinaras;
- statistik;
- profil;
- sejarah bila tersedia;
- visi dan misi bila tersedia;
- geografi;
- demografi;
- potensi kelurahan;
- fasilitas;
- galeri;
- kontak;
- lokasi/peta;
- pengumuman.

Konten penting jangan hard-code di komponen UI.
Gunakan CMS/data model sehingga perubahan Admin dapat langsung memengaruhi landing page tanpa redeploy.

## Pengaduan
Warga login Google → membuat pengaduan.

Minimal data:
- nomor tiket;
- warga/pelapor;
- kategori;
- judul;
- deskripsi;
- lokasi;
- lampiran/bukti opsional;
- waktu pengajuan;
- status;
- priority;
- catatan/respons Admin.

### Status
- `MENUNGGU`
- `DIPROSES`
- `SELESAI`
- `DITOLAK`

Makna:
- `MENUNGGU`: pengaduan belum dibuka/dibaca/ditanggapi Admin.
- `DIPROSES`: sedang ditangani.
- `SELESAI`: selesai.
- `DITOLAK`: tidak dapat/ tidak disetujui untuk diproses.

### Priority
Priority terpisah dari status:
- `NORMAL`
- `PERLU_PERHATIAN`

Saat Admin pertama kali membuka pengaduan, Admin wajib menentukan priority.

Workflow utama:
`MENUNGGU → DIPROSES → SELESAI`
atau
`MENUNGGU → DITOLAK`

Kelompok tampilan Admin:
- Pengaduan Yang Perlu Ditindaklanjuti = MENUNGGU + DIPROSES
- Pengaduan Yang Sudah Selesai = SELESAI + DITOLAK

## Dashboard Warga
Sidebar:
- Riwayat Pengaduan
- Profil

Header:
- profil singkat
- lonceng notifikasi

Isi:
- ringkasan/dashboard;
- riwayat pengaduan dengan UI menyerupai inbox Gmail;
- klik ringkasan → detail pengaduan;
- interactive complaint chart:
  - Selesai
  - Diproses
  - Menunggu
  - Ditolak

Profil:
- foto;
- informasi akun Google;
- informasi dasar.

Tidak boleh ada UI "ganti password SIPP" untuk warga.

## Notifikasi Warga
Notifikasi mencakup:
- pengaduan baru/diterima;
- perubahan status;
- respons/catatan Admin;
- pengumuman baru;
- event lain yang relevan.

Klik lonceng membuka halaman notifikasi lengkap.

## Dashboard Admin
Sidebar:
- Dashboard
- Pengaduan
- Pengumuman
- Konten Kelurahan
- Profil

Dashboard:
- statistik interaktif;
- pengaduan perlu ditindaklanjuti;
- pengaduan selesai;
- notifikasi.

### Statistik
Diagram 1:
- Selesai
- Dalam Proses
- Ditolak

Diagram 2:
- Pengaduan Biasa = priority NORMAL
- Pengaduan Perlu Perhatian = priority PERLU_PERHATIAN

### Admin Pengaduan
Admin dapat:
- membuka detail;
- menentukan priority;
- memberi catatan;
- membalas;
- mengubah status sesuai workflow.

## Pengumuman
Admin dapat membuat pengumuman:
- catatan/teks langsung;
- PDF;
- video.

Pengumuman:
- tampil di landing page;
- dapat menghasilkan notifikasi bagi warga;
- mempunyai publish/unpublish;
- file harus divalidasi dan disimpan dengan aman.

## Konten Kelurahan
Admin dapat mengelola:
- teks;
- statistik;
- potensi;
- foto/galeri;
- fasilitas;
- informasi kontak;
- lokasi/peta;
- elemen hero.

## Privacy dan Security
Jangan tampilkan secara publik:
- email warga;
- nomor telepon;
- OAuth ID;
- bukti pengaduan privat;
- internal note;
- field sensitif lainnya.

Authorization harus diberlakukan di server, bukan hanya menyembunyikan tombol di frontend.

## Visual
Identitas SIPP:
- modern;
- profesional;
- pemerintah/kelurahan;
- banyak whitespace;
- foto lokal Pinaras/Tomohon;
- siluet/nuansa alam Tomohon;
- tidak penuh ornamen;
- mobile-first;
- PWA friendly.

## Data Pinaras
Gunakan file `SIPP_PINARAS_MASTER_DATA.md` sebagai source of truth data Pinaras.
Jangan mengarang:
- sejarah;
- visi/misi;
- nama 8 lingkungan;
- nama objek wisata;
- kontak;
- nama pejabat;
- nama fasilitas;
- koordinat.

Data BPS adalah baseline historis; selalu simpan tahun sumber dan provenance.

## Tugas pada tahap ini
Jangan coding.
Buat:
1. PRD lengkap;
2. user flow;
3. use case;
4. functional requirements;
5. non-functional requirements;
6. role/permission matrix;
7. database/entity overview;
8. complaint workflow specification;
9. notification specification;
10. CMS/content specification;
11. file/media specification;
12. acceptance criteria;
13. edge cases;
14. security requirements;
15. PWA requirements;
16. feature breakdown;
17. development tasks.

Jika ada requirement yang ambigu/bertentangan:
- jangan menebak;
- buat bagian `Requirement Decisions Needed`;
- jelaskan konsekuensinya;
- ajukan keputusan yang perlu dibuat sebelum implementasi.

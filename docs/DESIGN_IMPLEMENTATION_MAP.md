# SIPP V2 — Pemetaan desain UI/UX

Diperbarui pada 10 Oktober 2026 setelah pemeriksaan langsung delapan aset PNG/JPG di
`public/images` beserta metadata HEIC. Tidak ditemukan subfolder.

Mockup menentukan tampilan; dokumen V2 menentukan role, data, autentikasi, status,
prioritas, dan privasi. Angka, nama orang, tanggal, notifikasi, serta persentase
dalam mockup adalah contoh visual, bukan sumber data aplikasi.

## Inventaris aset aktual

- `DESAIN LANDING PAGE.png` — PNG, 1024 × 1536, 2.085.564 byte.
  Mockup halaman publik panjang. Navbar terang dengan identitas biru tua,
  hero foto, aksen hijau, statistik berbentuk kartu, profil dua kolom,
  potensi, fasilitas/pengumuman, forum/galeri, lokasi, CTA, footer gelap.
  Acuan utama untuk `/`; pola kartu dan navigasi untuk `/pengaduan`,
  `/pengaduan/[ticketNumber]`, `/pengumuman`, `/pengumuman/[slug]`, `/offline`.
- `DESAIN LOGIN.png` — PNG, 1536 × 1024, 2.242.222 byte.
  Mockup login dua kolom di atas foto lanskap. Teks sambutan kiri,
  kartu putih kanan, Google terlebih dahulu, pemisah, form admin, CTA hijau.
  Acuan untuk `/login`. Tautan lupa password pada mockup tidak
  mengizinkan pembuatan mekanisme reset baru dalam milestone frontend ini.
- `DASHBOARD WARGA.png` — PNG, 1536 × 1024, 1.856.274 byte.
  Mockup sidebar biru dengan foto pada bagian bawah, menu aktif biru cerah,
  header putih, ringkasan empat kartu, donut, pengaduan/notifikasi,
  informasi dan aksi cepat. Acuan untuk seluruh `/warga/**`.
- `DASHBOARD ADMIN.png` — PNG, 1536 × 1024, 1.660.140 byte.
  Mockup shell yang sama, ringkasan, dua grafik, tabel pengaduan, notifikasi.
  Acuan untuk seluruh `/admin/**`.
- `DESAIN PENGUMUMAN.png` — PNG, 1214 × 1295, 1.757.204 byte.
  Referensi tambahan tahap 2: banner, breadcrumb, daftar pengumuman dengan
  thumbnail, metadata, pencarian, pagination, dan sidebar informasi.
  Acuan untuk `/pengumuman` serta komposisi detail. Kategori, tanggal, dan
  alamat contoh tidak disalin sebagai data. Thumbnail berasal dari lampiran
  pengumuman terbit; teks menggunakan stiker ikon pengumuman.
- `panorama-pinaras.png` — PNG, 941 × 1672, 3.650.206 byte.
  Foto udara vertikal permukiman dan vegetasi; bukan siluet/vector,
  bukan foto landscape gunung yang sama seperti dalam mockup.
  Dapat digunakan pada sidebar, hero, dan konten sesuai konteks/crop.
  Identitas lokasi, kredit, dan lisensinya perlu verifikasi sumber.
- `logo tomohon.png` — PNG, 564 × 543, 35.531 byte.
  Lambang Tomohon dengan latar putih; gunakan path dengan spasi yang benar.
  Aset identitas header/sidebar/footer; jangan memotong bentuk lambang.
- `Google Logo.jpg` — JPG, 840 × 859, 40.808 byte.
  Logo G berwarna dengan pola kotak abu-abu yang menyatu dengan JPG.
  Bukan transparansi asli. Acuan identitas tombol Google pada login;
  perlu aset resmi yang lebih bersih untuk kualitas final.
- `airterjun_tumimperas.HEIC` — HEIC/HEVC, metadata 3024 × 4032,
  3.443.304 byte. Nama file mengindikasikan foto air terjun, namun isi
  gambarnya belum dapat diperiksa: Sharp yang tersedia dapat membaca metadata
  tetapi tidak memiliki decoder HEVC untuk membuat preview.
  Jangan menganggap nama/lokasi sebagai fakta terverifikasi. Kandidat galeri/
  potensi setelah preview, provenance, serta konversi web diverifikasi.
  Tidak dipasang sebagai aset runtime dan tidak diubah.

Tidak ada aset foto landscape gunung, pertanian, kegiatan warga, atau peta yang
terpisah dari screenshot mockup. Jangan memasang screenshot sebagai background
halaman atau mengarang aset penggantinya.

## Dokumen lama dan konflik yang ditemukan

Pemetaan lama berdasarkan nama file saja dan mengaku tidak dapat melihat PNG.
Dokumen ini menggantikannya dengan inventaris dan inspeksi visual aktual.

Tiga file berikut sudah berstatus dihapus pada working tree sebelum redesign:
`DESAIN NEW DASHBOARD WARGA.png`,
`DESAIN NEW DASHBOARD LURAH.png`,
`DESAIN NEW DASHBOARD KEPALA LINGKUNGAN.png`.
Redesign tidak menghapus, memulihkan, atau mengubah aset tersebut.

Mockup warga menampilkan Ditolak dalam daftar tetapi tidak dalam diagram.
Mockup admin mencampurkan Perlu Perhatian dengan Menunggu/Diproses dalam satu
diagram, dan angka/persentasenya tidak selalu konsisten. Target V2 tetap empat
status, sedangkan prioritas adalah dimensi terpisah. Komposisi grafik sudah
dikoreksi pada tahap 2 dengan pilihan doughnut/pie/batang dan legenda status nol;
semantik backend tetap.

Label panjang SIPP pada beberapa mockup memakai “Pengaduan Publik”.
Identitas aplikasi mengikuti dokumen V2: “Sistem Informasi Peduli Pinaras”.

## Sistem desain fondasi

- Teks utama biru tua `#10366b`, teks sekunder `#587094`.
- Latar dashboard biru sangat terang `#f2f8fe`, kartu putih,
  border `#dce8f4`, shadow ringan.
- Aksi/dashboard biru `#087ac1`; hijau publik/login `#07845c`
  dengan tombol hijau gelap `#065e49`.
- Status: amber untuk Menunggu, biru Diproses, hijau Selesai, merah Ditolak.
  Semua badge tetap memiliki label teks.
- Radius kontrol 12 px, kartu 16 px; kontrol utama minimum 44 px.
- Arial/Helvetica/sans-serif dengan ukuran dasar 17 px mengikuti permintaan
  pengguna pada tahap 2. Metadata/tombol/tabel diperbesar. Tidak menambah
  dependency atau unduhan font eksternal.
- Ikon SVG bergaya stroke konsisten, tanpa emoji antarmuka.
- Fokus keyboard terlihat, scroll anchor menghindari header tetap,
  animasi menghormati reduced motion.
- Desktop sidebar 17 rem; drawer modal di bawah 1024 px dengan close,
  Escape, scroll internal, dan focus containment.
- Dialog native `showModal()` untuk modal/drawer, background inert,
  label terhubung, serta fokus kembali saat ditutup.
- Komponen tersedia di `src/components/ui`: Button, Card, Input, Select,
  Textarea, Notice, EmptyState, LoadingState, TableContainer, Icon, Dialog.
  Komponen dipakai bertahap; styling inline lama belum seluruhnya dimigrasikan.

Warna dan tipografi ini adalah interpretasi visual yang disesuaikan agar kontras
teks normal minimal 4,5:1 pada kombinasi token yang diuji. Tidak diklaim sebagai
ekstraksi font/warna persis dari screenshot.

## Urutan implementasi

1. Fondasi: token/global layout, komponen bersama, navigasi publik,
   shell dashboard, dialog, notifikasi, loading/error.
   Integrasi navbar pada `/` hanya mengganti navigasi; isi CMS tetap.
2. Publik: komposisi lengkap landing, login, forum/detail, pengumuman/detail,
   offline dengan komponen fondasi.
3. Warga: komposisi dashboard, riwayat, form, detail tiket, profil, notifikasi.
4. Admin: komposisi dashboard, antrean/detail, pengumuman, CMS, profil, notifikasi.

Verifikasi visual diperlukan pada lebar 360, 390, 768, 1024, dan 1440 px dengan
data sintetis. Browser tidak tersedia dalam sesi implementasi fondasi; jangan
menyatakan screenshot, focus/Escape runtime, atau seluruh responsivitas telah
lulus sampai benar-benar diuji.

Tahap 2 sudah mengimplementasikan komposisi landing dan pengumuman publik,
layout publik bersama, pilihan grafik dashboard, perbaikan edit/detail
pengumuman admin, upload/drop dan pembesaran bukti, avatar, konfirmasi tindakan,
serta penataan profil/form/daftar/detail. Hasil verifikasi dan daftar file ada di
`docs/UI_REDESIGN_STAGE_2.md`. Batas pengujian browser di atas masih berlaku.

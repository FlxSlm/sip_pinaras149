# SIPP V2 — CMS / Dynamic Landing Page Specification

## Tujuan
Sesuai arahan pengguna 14 Oktober 2026, hanya **struktur kelurahan** yang dapat diubah Admin Kelurahan tanpa redeploy. Admin dapat memperbarui nama dan foto untuk jabatan pada bagan referensi yang diberikan pengguna. Jabatan tanpa nama tetap kosong hingga diisi admin. Data konten lain tetap disimpan dan dibaca, tetapi endpoint CMS menolak perubahan section lama.

Daftar section berikut mendokumentasikan konten lama yang dipertahankan; section ini bukan lagi fitur CMS yang dapat diedit. Lihat [USER_REQUEST_2026_10_14.md](USER_REQUEST_2026_10_14.md) untuk provenance dan perubahan requirement.

## Section
- Hero
- Profil singkat
- Profil lengkap
- Sejarah
- Visi & Misi
- Statistik
- Potensi
- Fasilitas
- Galeri
- Pengumuman
- Peta/lokasi
- Kontak

## Statistik
Metadata sebaiknya mencakup:
- label
- value
- unit
- source
- source_table
- source_year
- source_page
- verified_at
- published

Data BPS 2020 harus dilabeli tahun sumber dan tidak boleh disebut sebagai data terkini tanpa verifikasi.

## Potensi
Admin dapat create/edit/reorder/publish/unpublish dan mengelola gambar serta sumber/catatan.

## Galeri
Admin dapat upload image, caption, category, credit, sort order, publish/unpublish. Prioritaskan foto asli Pinaras.

## Fasilitas
Nama/alamat fasilitas yang tidak tersedia dari sumber resmi harus melalui verifikasi manual.

## Hero
Gunakan satu foto lokal Pinaras yang kuat, landscape, dengan ruang visual untuk teks. Identitas visual terinspirasi lanskap Tomohon/Pinaras.

## Pengumuman
Admin dapat membuat text/catatan, PDF, dan video. Sesuai arahan terbaru, hanya Draft dan Terbit tersedia pada editor, serta Semua/Terbit/Draft pada filter. Status baru hanya DRAFT/PUBLISHED. Nilai ARCHIVED lama tetap disimpan sebagai data historis dan ditampilkan sebagai Draft pada admin tanpa mengubah record saat dibaca. Hanya PUBLISHED tampil publik.

## Peta
Koordinat/boundary harus dari data yang diverifikasi; jangan mengarang polygon administratif.

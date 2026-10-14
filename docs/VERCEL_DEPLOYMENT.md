# Menyiapkan Preview Vercel SIPP V2

Panduan untuk kode aktual setelah persiapan deployment, 10 Oktober 2026.
Tidak ada deployment atau perubahan database production dalam sesi ini.

## Konfigurasi repository

- Next.js 16.3.8, NextAuth 4.24.15, Prisma CLI/client/adapter 7.10.0.
- Node.js **24.x**, ditentukan dalam package.json dan .nvmrc.
- vercel.json: framework Next.js, install npm ci, build npm run build:vercel.
- Build Vercel memeriksa format environment, generate Prisma Client, menyiapkan
  PDF.js lokal, kemudian build Next.js. Build **tidak** menjalankan migration atau seed.
- Runtime PostgreSQL memakai DATABASE_URL dan pool maksimal 3 koneksi per instance.
  Timeout koneksi 5 detik. Gunakan pooler provider agar total instance tidak
  menghabiskan batas koneksi PostgreSQL.
- Prisma CLI dan bootstrap admin memakai DIRECT_URL bila diatur, lalu DATABASE_URL.
  Sertakan opsi TLS yang diberikan provider; kode tidak mematikan validasi TLS.
- File baru di Vercel/Production memakai **satu Blob store privat** per lingkungan. Tidak ada fallback
  penulisan storage lokal pada deployment. Development dengan database localhost dan tanpa token Blob
  dapat menyimpan berkas privat di `storage/uploads/`, di luar public dan diabaikan Git.
  Endpoint lokal dinonaktifkan untuk NODE_ENV production, Vercel, dan database nonlocalhost.
  Konten pengumuman terbit dapat dibaca publik lewat API;
  object tetap privat supaya unpublish/draft tidak meninggalkan URL publik.

## Environment dari kode aktual

Atur nilai Preview dan Production secara terpisah. Nilai rahasia tidak dicantumkan.

- **DATABASE_URL** — wajib keduanya. URL PostgreSQL terkelola untuk runtime,
  biasanya endpoint pooled. Preview harus database/branch terpisah dari Production.
- **DIRECT_URL** — disarankan keduanya untuk CLI migration dan inisialisasi admin.
  Endpoint langsung ke database yang sama dengan DATABASE_URL dalam lingkungan itu.
  Jika tidak ada, CLI menggunakan DATABASE_URL; pastikan endpoint mendukung migration.
- **AUTH_SECRET** — wajib keduanya, minimal 32 karakter acak. Mengenkripsi JWT/session
  dan mendukung pemeriksaan token. Pakai secret terpisah untuk Preview/Production.
- **NEXTAUTH_SECRET** — alias lama opsional. Jika AUTH_SECRET juga diatur, kedua
  nilainya harus identik. Pilih AUTH_SECRET sebagai konfigurasi utama.
- **NEXTAUTH_URL** — wajib keduanya pada build Vercel. Origin HTTPS yang benar
  tanpa path/query, memakai domain Preview stabil atau domain Production terkait.
  Local development menggunakan http://localhost:3000.
- **AUTH_GOOGLE_ID** — wajib keduanya. Client ID Google OAuth Web Application.
- **AUTH_GOOGLE_SECRET** — wajib keduanya. Client secret pasangan ID di atas,
  hanya pada environment server.
- **BLOB_READ_WRITE_TOKEN** — wajib keduanya pada kode ini. Token untuk Blob store
  **Private**, terpisah antar lingkungan. SDK server juga membaca variabel ini.
  Tidak menggunakan NEXT_PUBLIC_ untuk token atau credential apa pun.
- **ADMIN_SEED_PASSWORD** — hanya pada proses CLI inisialisasi akun pertama,
  minimal 12 karakter setelah trim dan maksimal 256. Bukan sumber password login
  runtime. Akun yang sudah ada dipertahankan, termasuk hash/passwordnya. Tidak
  diperlukan pada build Vercel dan sebaiknya tidak disimpan sebagai env runtime.
- **NODE_ENV** — disediakan runtime/Next.js. Mengaktifkan PWA pada production build,
  membatasi reader file development, dan melindungi seed contoh.
- **VERCEL** — disediakan Vercel. Mencegah seed contoh dan pembacaan file development.
- **VERCEL_ENV** — disediakan Vercel. Script migrasi file menolak apply ketika
  bernilai production.

Nama lain yang mungkin disediakan dashboard/SDK Vercel bukan pengganti otomatis
variabel wajib di atas. .env.example kini dapat dimasukkan ke Git; .env.local,
file QA berisi URL database, dan backup referensi tetap diabaikan.

## PostgreSQL Preview: langkah manual

1. Buat database atau branch **Preview baru** di provider PostgreSQL Anda.
   Jangan gunakan database Production untuk Preview.
2. Ambil connection string pooled dan direct, dengan konfigurasi TLS provider.
   Masukkan DATABASE_URL/DIRECT_URL pada Vercel environment Preview.
3. Sebelum deployment, jalankan pada terminal/CI tepercaya dengan **environment
   Preview sudah di-set pada proses**:
   - npm run db:validate
   - npm run db:deploy
   - npm run db:init-admin
4. Untuk db:init-admin, sediakan ADMIN_SEED_PASSWORD melalui secret manager atau
   environment proses, lalu hapus dari konteks runtime setelah bootstrap.
5. Pastikan DIRECT_URL dan DATABASE_URL menuju target yang sama. prisma.config.ts
   masih memuat .env.local untuk development; environment proses harus sengaja
   diarahkan ke Preview. Jangan mengandalkan sebuah file env Preview yang
   didownload tetapi tidak dimuat oleh CLI.
6. Ulang db:deploy boleh dilakukan: migration yang telah berhasil tidak diterapkan
   ulang. Tidak menggunakan migrate reset, db push, atau perubahan manual tabel
   _prisma_migrations.

Enam migration berhasil diuji dari database kosong. Migration V2 historis
menghapus akun/field V1; hasil ini **bukan** jaminan upgrade database V1 berisi data
aman. Untuk target yang mempunyai riwayat/data lain, audit/backup dan rencana
upgrade khusus diperlukan. Jangan memperbaiki checksum dengan mengganti file
migration terapan atau menulis tabel riwayat.

## Vercel dan Blob: langkah manual

1. Tinjau, commit, dan push perubahan repository, lalu import project sebagai Next.js.
2. Pilih Node.js 24.x pada Project Settings. Gunakan build/install dari vercel.json.
3. Konfigurasikan variabel environment Preview di atas sebelum install/build.
4. Buat Blob store **Private**, hubungkan ke Preview, dan sediakan
   BLOB_READ_WRITE_TOKEN yang sesuai. Jika koneksi dashboard hanya menyediakan OIDC,
   buat token read-write untuk variabel yang secara eksplisit dipakai kode ini.
5. Pertahankan database, store, dan secret Preview terpisah dari Production.
   Variabel Production didokumentasikan untuk persiapan selanjutnya.
6. Sediakan domain/alias Preview yang stabil untuk OAuth, lalu cocokkan NEXTAUTH_URL.
7. Jalankan **Preview Deployment** setelah migration/bootstrap Preview selesai.
   Jangan jalankan Production Deployment pada tahap ini.

Blob langsung diunggah browser memakai token terbatas pada path acak, MIME,
ukuran, expiry 30 menit, dan tanpa overwrite. Server memeriksa metadata, signature,
owner, purpose, expiry, serta konsumsi intent atomik dengan resource. Bukti maksimal
8 foto; foto 5 MB, PDF 10 MB, video 50 MB. Body file tidak melewati API Next.js.

Alur tidak memerlukan webhook upload-completed: setelah direct upload selesai,
browser mengirim upload ID ke API resource; server memeriksa Blob secara langsung.
Token read-write penuh tidak dikirim ke browser.

## Google Cloud: langkah manual

1. Konfigurasikan OAuth consent screen dengan scope openid, email, profile.
2. Untuk Preview berstatus Testing, tambahkan akun Google tester.
3. Buat OAuth client tipe Web Application. Masukkan ID/secret pada variabel
   AUTH_GOOGLE_ID/AUTH_GOOGLE_SECRET lingkungan yang bersangkutan.
4. Daftarkan redirect URI **persis**:
   https://<domain-preview>/api/auth/callback/google
5. Authorized JavaScript origin dapat memakai https://<domain-preview>.
   Untuk development, pertahankan http://localhost:3000 dan callback lokal.
6. Gunakan domain Preview stabil; wildcard redirect URI tidak digunakan.
7. Sesuaikan akses Deployment Protection agar tester dapat membuka aplikasi dan
   callback Google. Jangan menonaktifkan proteksi role atau proxy aplikasi.
8. Sesudah Preview aktif, uji consent dan callback dengan akun warga baru serta
   akun warga yang sudah terhubung. Periksa /warga, session, dan penolakan /admin.

Kode tetap menolak admin via Google dan warga via credentials. Pengguna Google
tidak memiliki password SIPP dan tidak mendapat UI ganti password.

## Mempertahankan enam file legacy

Audit baca-saja menemukan enam referensi file lokal, keenam file ada dan valid.
Referensi lama belum diubah karena token Blob belum tersedia.

- npm run storage:audit — default dry-run, tanpa upload atau perubahan database.
- Untuk target **nonproduction** yang sengaja dikonfirmasi:
  npm run storage:audit -- --apply --confirm-target
- Proses apply harus memiliki DATABASE_URL/DIRECT_URL target nonproduction dan
  BLOB_READ_WRITE_TOKEN privat. Jalankan dari mesin yang memiliki file storage lama.
- Script mencatat backup referensi privat ke .deployment-qa sebelum update,
  memakai compare-and-update agar tidak menimpa perubahan konkuren, dan dapat
  dijalankan ulang. File lokal lama tidak dihapus.
- Hasil apply harus diperiksa kembali dengan audit dan download melalui API.
  Tidak menjalankan apply dalam sesi persiapan ini.
- Jika memindahkan data ke database Preview baru, restorasi salinan data dan
  pencocokan riwayat migration adalah pekerjaan tersendiri; jangan mengimpor
  folder storage ke public/ atau memublikasikan bucket bukti.
- Reader lokal hanya untuk NODE_ENV=development dan VERCEL tidak ada, sehingga
  file lama tetap dapat dibaca secara terotorisasi dalam development. Pada Vercel,
  referensi lokal tidak dapat dibaca sampai dipindahkan ke Blob.

## Penerimaan Preview

Periksa pada layanan nyata: Google consent/callback, login admin, session HTTPS,
upload foto/bukti 5 MB, PDF 10 MB, video 50 MB, Range playback, thumbnail PDF/video,
draft tidak publik, warga A tidak dapat bukti warga B, serta unpublish menutup
media publik. Uji juga di perangkat mobile/browser.

Tes otomatis memakai mock Blob dan database lokal terisolasi, bukan store/cloud
Production. Belum ada klaim consent Google, roundtrip Blob nyata, atau koneksi
PostgreSQL terkelola sudah diuji.

Upload yang dibatalkan/gagal dan file lama setelah diganti dapat meninggalkan
object privat tanpa referensi aktif. Pemantauan biaya dan housekeeping perlu
disiapkan; tidak ada penghapusan object massal otomatis dalam perubahan ini.
Rate limit intent upload tersedia, tetapi proteksi abuse/login menyeluruh tetap
memerlukan kebijakan firewall/rate limiting sebelum publikasi Production.

## Referensi resmi

- https://vercel.com/docs/vercel-blob/client-upload
- https://vercel.com/docs/vercel-blob/private-storage
- https://vercel.com/docs/functions/limitations
- https://vercel.com/docs/functions/runtimes/node-js/node-js-versions
- https://next-auth.js.org/configuration/options
- https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/databases-connections

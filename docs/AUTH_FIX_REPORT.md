# Perbaikan autentikasi SIPP V2 — 10 Oktober 2026

## Akar masalah yang diverifikasi

Database belum memiliki kolom nullable `User.customImage`, padahal field itu sudah
ada pada schema Prisma dan client hasil generate. Query User penuh pada credentials
provider serta lookup User oleh PrismaAdapter gagal. Uji HTTP admin sebelum perubahan
menghasilkan 401 dengan kategori schema mismatch; log NextAuth juga menunjukkan
`OAUTH_CALLBACK_HANDLER_ERROR`.

Akun `admin.pinaras` ditemukan dengan role `ADMIN_KELURAHAN`, hash scrypt valid,
dan password konfigurasi cocok dengan hash tersimpan. Identifier dan konfigurasi
environment bukan penyebab penolakan. Nilai rahasia tidak dicetak.

Masalah tambahan: halaman login tidak memeriksa session server; callback URL
tidak dibatasi menurut role; token dengan role tidak valid bisa diarahkan bolak-balik
antara dashboard. Seed lama justru memperbarui password setiap kali dijalankan,
bukan hanya membuat akun baru.

## Perubahan

- `src/lib/auth.ts`: select field credentials yang diperlukan, error database aman,
  pembatasan provider/role, validasi identitas JWT/session, callback redirect aman.
- `src/lib/authorization.ts`: validasi role, tujuan internal menurut role,
  role tidak lengkap menuju login.
- `src/lib/auth-errors.ts`: pesan kegagalan aman, termasuk OAuth batal/gagal.
- `src/proxy.ts`: ID/role wajib valid, query callback dipertahankan,
  akses lintas role tetap ditolak.
- `src/app/login/page.tsx`: pemeriksaan session server dan redirect pengguna yang
  sudah login. `src/components/login-form.tsx`: form lama dipindah, tujuan login
  menurut role, pengecekan session setelah credentials, penanganan kegagalan async.
- `src/lib/password.ts`: menolak hash scrypt malformed/terpotong.
- `prisma/seed-admin.ts`, `prisma/seed.ts`: hashing bersama; akun admin lama tidak
  ditimpa; akun dengan role/hash kosong yang konflik ditolak tanpa perubahan.
- `.env.example`: penjelasan ADMIN_SEED_PASSWORD untuk pembuatan awal saja.
- `scripts/auth-diagnose.ts`, `scripts/auth-smoke.ts`,
  `scripts/auth-google-session-smoke.ts`: diagnosis dan verifikasi lokal dengan
  output status/boolean, tanpa password/hash/cookie/identitas pribadi.

## Migration dan data

Migration `20261010000000_add_user_custom_image` diterapkan melalui
`npm.cmd exec -- prisma migrate deploy`. SQL hanya
`ALTER TABLE "User" ADD COLUMN "customImage" TEXT;`.

Tidak ada reset database, penghapusan pengguna, seed ulang, reset password,
perubahan schema Prisma, atau pengubahan record migration lama. Deployment mencatat
migration baru lewat mekanisme Prisma standar. Diagnosis sesudahnya menunjukkan
kolom User lengkap dan password admin masih cocok.

Seluruh migration aktif yang selesai memiliki checksum sesuai file. Riwayat
percobaan V2 yang dahulu di-rollback mempunyai checksum berbeda dan tetap dibiarkan
utuh; percobaan V2 yang berhasil sesuai file.

## Verifikasi

Tes diubah: `src/lib/auth-config.test.ts`, `src/lib/authorization.test.ts`.
Tes baru: `src/lib/auth-flow.test.ts`, `src/lib/seed-admin.test.ts`,
`src/lib/auth-errors.test.ts`, `src/proxy.test.ts`, `src/app/login/page.test.ts`.
Mencakup credentials benar/salah, normalisasi username, kegagalan database,
Google/role, JWT/session, callback aman, login dengan session, akses guest/lintas
role, hash malformed, seed akun baru/lama/konflik, dan pesan error OAuth.

Perintah verifikasi:

- `npm.cmd test`: 124 tes lulus pada 15 file.
- `npm.cmd run typecheck`: lulus.
- `npm.cmd exec -- eslint` untuk seluruh file TS/TSX autentikasi yang berubah: lulus.
- `npm.cmd run lint`: gagal hanya pada dua error lama `no-require-imports`
  di `check_checksum.js` baris 1 dan 2; tidak ada error lint baru.
- `npm.cmd run build`: lulus.
- `npm.cmd exec -- tsx scripts/auth-diagnose.ts`: koneksi berhasil, kolom lengkap,
  akun/role/hash admin valid dan cocok dengan password konfigurasi.
- `npm.cmd exec -- tsx scripts/auth-smoke.ts`: login admin HTTP aktual berhasil,
  session valid, `/admin` 200; login ulang dengan session menuju `/admin`;
  `/warga` menolak admin; guest menuju login; password salah ditolak tanpa session.
- `npm.cmd exec -- tsx scripts/auth-google-session-smoke.ts`: lookup akun Google
  oleh adapter berhasil; ID tersimpan dan role WARGA bertahan dalam session;
  `/warga` 200; `/admin` menolak warga; login dengan session menuju `/warga`.
  Ini memakai JWT lokal untuk akun Google yang sudah tertaut, bukan pertukaran
  kode OAuth sungguhan. Tidak menulis data akun.

Redirect dari login dapat dikirim lewat meta refresh dalam HTML streaming Next.js,
sehingga pemeriksaan mencakup HTML tersebut selain header Location.

## Pengujian manual yang masih diperlukan

Browser otomatis tidak tersedia. Login Google sungguhan (consent, pertukaran kode,
cookie browser, dan kembali ke dashboard) belum diuji. Buka localhost:3000/login
dalam browser, login Google warga, pastikan masuk `/warga`; buka `/login` kembali
dan pastikan kembali ke dashboard. Uji pembatalan login dan pastikan pesan aman.
Verifikasi redirect URI Google sesuai `/api/auth/callback/google` pada origin
yang dipakai. Login admin melalui form juga perlu dicoba dalam browser.

Tidak perlu menjalankan seed atau mengubah `.env.local`. Perubahan
ADMIN_SEED_PASSWORD kelak tidak mengganti password admin yang sudah ada;
gunakan fitur perubahan password pada profil admin. Session lama yang tidak
memiliki ID/role valid memerlukan login ulang. Redesign lanjutan ditunda.

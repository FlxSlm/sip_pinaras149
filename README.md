 # SIP Pinaras

 Sistem Informasi Peduli Pinaras berbasis Next.js, Prisma 7, dan PostgreSQL.

 ## Menjalankan proyek

 ```bash
 npm install
 npm run dev
 ```

 Salin `.env.example` menjadi `.env.local`, lalu sesuaikan `DATABASE_URL` dengan PostgreSQL lokal.

Untuk mengaktifkan login warga, isi `AUTH_SECRET` dengan nilai acak panjang dan daftarkan callback OAuth berikut di masing-masing console provider:

```text
Google:   http://localhost:3000/api/auth/callback/google
Facebook: http://localhost:3000/api/auth/callback/facebook
```

Masukkan client ID dan secret ke `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_FACEBOOK_ID`, dan `AUTH_FACEBOOK_SECRET`. Tanpa kredensial provider tersebut, tombol akan tampil sebagai belum dikonfigurasi dan tidak akan mengirim request OAuth yang pasti gagal.

Jika PostgreSQL berjalan sebagai service Windows dengan password berbeda, `DATABASE_URL` wajib memakai username, password, port, dan nama database yang benar. Project tidak dapat menebak password database lokal.

 ## Database

 Setelah PostgreSQL tersedia dan kredensial benar:

 ```bash
 npm run db:migrate -- --name init
 npm run db:seed
 ```

 Seed membuat 8 lingkungan, 1 Lurah, 8 Kepala Lingkungan, dan 1 warga contoh. Nama `Lingkungan 01` sampai `Lingkungan 08` masih placeholder karena nama resmi belum tersedia di dokumen proyek; ganti nilainya di `prisma/seed.ts` sebelum deployment.

 Password seed hanya untuk development dan harus diganti sebelum dipakai di lingkungan lain.

 ## Pemeriksaan

 ```bash
 npm run lint
 npm run typecheck
 npm run build
 ```

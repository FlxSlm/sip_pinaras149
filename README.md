 # SIP Pinaras

 Sistem Informasi Peduli Pinaras berbasis Next.js, Prisma 7, dan PostgreSQL.

 ## Menjalankan proyek

 ```bash
 npm install
 npm run dev
 ```

 Salin `.env.example` menjadi `.env.local`, lalu sesuaikan `DATABASE_URL` dengan PostgreSQL lokal.

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

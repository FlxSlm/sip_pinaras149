# SIP — Sistem Informasi Peduli Pinaras
## Project Specification v3.0

**Project context:** Kegiatan KKT, Kelurahan Pinaras  
**Primary goal:** Mendigitalisasi alur pengaduan masyarakat yang berjalan di lapangan dengan batas sistem sampai pada Lurah.  
**Development style:** AI-assisted / vibe coding, dengan requirement-driven dan verification-driven workflow.

---

## 1. Executive Summary

SIP (Sistem Informasi Peduli Pinaras) adalah aplikasi web modern untuk Kelurahan Pinaras yang menggabungkan:

1. Profil dan informasi kelurahan.
2. Pengumuman/surat edaran.
3. Pengaduan masyarakat.
4. Alur pengaduan internal: **Warga → Kepala Lingkungan → Lurah**.
5. Transparansi publik melalui publikasi pengaduan yang telah diproses/disanitasi.
6. Rating kepuasan 1–5 bintang untuk pengaduan yang telah selesai.
7. Progressive Web App (PWA).
8. Autentikasi warga melalui Google/Facebook.
9. Autentikasi petugas melalui credentials aplikasi.

Sistem **tidak** mengimplementasikan level Camat atau tingkat pemerintahan di atas Lurah. Jika suatu pengaduan berada di luar kewenangan kelurahan, Lurah dapat memberi status `DI_LUAR_KEWENANGAN`; tindak lanjut setelah itu berada di luar scope SIP.

---

## 2. Foundational Design Decisions

### 2.1 Workflow follows the field process

Hasil wawancara lapangan menunjukkan alur:

> Masyarakat → Kepala Lingkungan → Lurah → Camat dan seterusnya jika di luar kemampuan/kewenangan Lurah.

SIP hanya mencakup:

> **Warga → Kepala Lingkungan → Lurah**

### 2.2 Internal complaint data and public information are different

Pengaduan yang baru dibuat **tidak otomatis menjadi informasi publik**.

Data internal digunakan untuk proses pelayanan. Hanya informasi pengaduan yang sudah dinilai layak dipublikasikan yang boleh muncul pada halaman publik.

### 2.3 Handling status and publication status are separate

Gunakan dua konsep terpisah:

- `handling_status`: posisi pengaduan dalam alur pelayanan.
- `publication_status`: apakah versi publik pengaduan tersedia.

Jangan menggunakan satu field untuk sekaligus mewakili proses internal dan visibilitas publik.

### 2.4 No NIK

SIP tidak meminta atau menyimpan NIK sebagai requirement aplikasi.

---

## 3. Technology Stack

### Baseline

- **Next.js 16.3.x** — full-stack React framework.
- **React 19.3.x**.
- **TypeScript**.
- **Tailwind CSS**.
- **PostgreSQL**.
- **Prisma ORM 7.x** stable baseline.
- **Auth.js / NextAuth** untuk OAuth dan session authentication.
- **Zod** untuk schema validation.
- PWA menggunakan Web App Manifest + Service Worker.
- ESLint + formatter sesuai template/project convention.

### Runtime baseline

- Gunakan **Node.js 22.18+** untuk konsistensi dengan current Prisma/Next.js ecosystem.
- Jangan downgrade ke Node 18.
- Package manager: **npm** kecuali project menetapkan lain.

### Architecture

Gunakan Next.js App Router dan TypeScript dengan pendekatan full-stack yang terintegrasi.

Jangan membuat frontend React terpisah dan backend Next.js terpisah kecuali ada kebutuhan yang teridentifikasi kemudian.

---

## 4. User Roles

### 4.1 Guest / Pengunjung

Tidak perlu login.

Dapat:

- Melihat beranda.
- Melihat profil kelurahan.
- Melihat informasi layanan.
- Melihat pengumuman publik.
- Mengunduh/membuka PDF pengumuman.
- Melihat rekap pengaduan yang memang telah dipublikasikan.
- Melihat statistik rating publik.
- Melihat informasi kontak kelurahan.

Tidak dapat melihat:

- pengaduan internal;
- identitas pelapor;
- foto bukti privat;
- catatan internal petugas.

### 4.2 Warga

Login melalui Google atau Facebook.

Dapat:

- Melihat dan mengedit profil SIP sendiri.
- Memilih username SIP.
- Membuat pengaduan.
- Melihat pengaduan miliknya sendiri.
- Melihat riwayat status pengaduan miliknya.
- Memberikan rating 1–5 pada pengaduan miliknya yang sudah `SELESAI` dan belum memiliki rating.

Tidak dapat:

- Melihat pengaduan privat warga lain.
- Mengubah status pengaduan.
- Melihat catatan internal petugas.
- Mengubah data petugas.

### 4.3 Kepala Lingkungan

Login menggunakan akun petugas yang dibuat oleh pihak kelurahan/admin sistem.

Setiap akun Kepala Lingkungan terhubung ke **tepat satu lingkungan**.

Dapat:

- Melihat pengaduan baru dari lingkungan yang menjadi tanggung jawabnya.
- Melihat detail internal pengaduan pada lingkungannya.
- Memverifikasi pengaduan.
- Memberi catatan internal.
- Meneruskan pengaduan kepada Lurah.
- Melihat statistik lingkungan sendiri.
- Melihat riwayat aktivitas yang menjadi tanggung jawabnya.

Tidak dapat:

- Melihat/mengubah pengaduan lingkungan lain kecuali hak khusus ditambahkan kemudian.
- Menetapkan pengaduan menjadi `SELESAI`.
- Memberikan respon resmi Lurah.
- Mengubah akun warga/Lurah.

### 4.4 Lurah

Dapat:

- Melihat pengaduan yang sudah diteruskan dari seluruh lingkungan.
- Melihat detail lengkap yang diperlukan untuk pelayanan.
- Memberikan respon resmi.
- Mengubah status menjadi `DALAM_PROSES`.
- Mengubah status menjadi `SELESAI`.
- Menandai `DI_LUAR_KEWENANGAN`.
- Mengatur apakah suatu pengaduan layak dipublikasikan.
- Mengelola pengumuman.
- Melihat statistik agregat seluruh kelurahan.

---

## 5. Organizational Master Data

Buat tabel master `lingkungan`.

Pada deployment awal terdapat **8 lingkungan** di Kelurahan Pinaras.

Jangan mengarang nama resmi lingkungan. Gunakan nilai dari hasil wawancara/dokumen resmi kelurahan saat seeding.

Contoh konseptual:

| id | nama | kode | aktif |
|---:|---|---|---|
| 1 | <isi nama resmi> | L01 | true |
| 2 | <isi nama resmi> | L02 | true |
| … | … | … | … |
| 8 | <isi nama resmi> | L08 | true |

---

## 6. Authentication & Identity

### 6.1 Warga OAuth

Provider:

- Google
- Facebook

Saat login pertama:

1. Dapatkan provider account identity.
2. Cari user berdasarkan provider account yang terhubung.
3. Jika user belum ada, buat akun warga.
4. Tentukan username SIP awal:
   - gunakan nickname/username provider bila benar-benar tersedia dan aman;
   - fallback ke nama pengguna yang dinormalisasi;
   - jika bentrok, tambahkan suffix aman.
5. Username dapat diedit oleh warga di aplikasi.

### 6.2 Identity rule

`username` SIP **bukan** pengganti `google/fb provider account ID`.

Provider identity harus tetap berada pada layer autentikasi yang didukung Auth.js.

### 6.3 Username requirements

- unik;
- panjang minimum/maksimum ditetapkan schema validation;
- karakter aman;
- reserved route/system words ditolak;
- perubahan username tidak mengubah provider identity;
- username lama tidak otomatis menjadi identitas OAuth baru.

### 6.4 Petugas

Petugas (`kepala_lingkungan`, `lurah`) menggunakan credentials aplikasi.

Tidak ada requirement OAuth untuk petugas.

---

## 7. Complaint Workflow

### 7.1 Status internal

Gunakan logical values:

- `DIAJUKAN`
- `DIVERIFIKASI`
- `DITERUSKAN_KE_LURAH`
- `DALAM_PROSES`
- `SELESAI`
- `DI_LUAR_KEWENANGAN`

### 7.2 State transitions

```text
DIAJUKAN
   ↓
DIVERIFIKASI
   ↓
DITERUSKAN_KE_LURAH
   ↓
DALAM_PROSES
   ↓
SELESAI
```

Alternative terminal state:

```text
DITERUSKAN_KE_LURAH
   ↓
DI_LUAR_KEWENANGAN
```

State transitions harus divalidasi server-side.

### 7.3 Public publication

Status internal tidak otomatis berarti public.

Sediakan kontrol publikasi terpisah, misalnya:

- `DRAFT`
- `PUBLISHED`

Pengaduan baru default:

```text
publication_status = DRAFT
```

Data publik harus melalui sanitization/presentation mapping.

---

## 8. Complaint Routing

Ketika warga membuat pengaduan:

1. User wajib authenticated sebagai `warga`.
2. User memilih satu `lingkungan`.
3. `lingkungan_id` disimpan pada pengaduan.
4. Pengaduan masuk ke queue/dashboard Kepala Lingkungan terkait.
5. Kepala Lingkungan memverifikasi.
6. Kepala Lingkungan meneruskan ke Lurah.
7. Lurah menangani.

Aktor dan pemilik data tidak boleh ditentukan oleh nilai request yang dipercaya secara buta. Identity utama harus berasal dari session server-side.

---

## 9. Complaint Ticket

Format tampilan tiket:

```text
LPR-YYYYMM-###
```

Contoh:

```text
LPR-202609-001
```

Requirement:

- unique database constraint;
- dua request bersamaan tidak boleh menghasilkan tiket sama;
- gunakan transaction/locking/counter strategy;
- jangan menggunakan `count(*) + 1` sebagai satu-satunya mekanisme.

---

## 10. Complaint Data Model

Minimum conceptual fields:

### `users`

- id
- username
- name
- email nullable
- phone nullable
- role
- lingkungan_id nullable
- timestamps

Provider identities dikelola melalui Auth.js adapter/model authentication sesuai kebutuhan; jangan membuat desain OAuth duplikatif tanpa alasan.

### `lingkungan`

- id
- name
- code
- active
- timestamps

### `complaints` / `pengaduan`

- id
- reporter_user_id
- lingkungan_id
- ticket_number
- title
- category
- description
- evidence_path nullable
- handling_status
- internal_note nullable
- official_response nullable
- responded_at nullable
- rating nullable (1–5)
- rated_at nullable
- publication_status
- published_at nullable
- timestamps

### `complaint_logs` / `pengaduan_logs`

- id
- complaint_id
- actor_user_id nullable where appropriate
- action
- from_status nullable
- to_status nullable
- note nullable
- created_at

Audit log tidak boleh diedit melalui UI biasa.

---

## 11. Public Privacy Policy

### Publicly displayable

- nomor tiket/public reference;
- judul atau short title;
- kategori;
- lingkungan;
- tanggal;
- status publik yang aman;
- respon resmi yang memang ditujukan untuk publik;
- rating;
- metadata agregat.

### Never expose publicly

- nama lengkap pelapor;
- email pelapor;
- nomor WhatsApp;
- provider account IDs;
- session data;
- foto bukti privat;
- internal note;
- raw description bila dapat mengandung data pribadi;
- path file internal;
- data teknis internal lain.

### Public summary

Gunakan versi publik yang telah disanitasi. Jangan otomatis merender raw internal description.

---

## 12. Complaint Visibility Rules

### Kepala Lingkungan

```text
complaint.lingkungan_id = currentUser.lingkungan_id
```

### Lurah

Seluruh complaint yang telah masuk scope Lurah sesuai workflow.

### Warga

```text
complaint.reporter_user_id = currentUser.id
```

### Public

```text
complaint.publication_status = PUBLISHED
```

dan hanya melalui public DTO/view-model yang telah disanitasi.

---

## 13. Rating

Rating tersedia hanya jika:

1. user login;
2. user adalah pemilik complaint;
3. status = `SELESAI`;
4. rating masih `null`.

Nilai:

```text
1, 2, 3, 4, 5
```

Server-side validation wajib.

Setelah tersimpan:

- isi `rating`;
- isi `rated_at`;
- jangan izinkan rating kedua melalui endpoint biasa.

### Public statistics

- total voter;
- average rating;
- pembulatan satu decimal pada presentation layer.

---

## 14. Public Website

Minimum public pages:

```text
/
/profil
/layanan
/pengumuman
/pengumuman/[slug]
/pengaduan
/tentang-sip
/kontak
```

Fokus UX:

- mobile-first;
- tombol besar;
- contrast baik;
- typography mudah dibaca;
- bahasa Indonesia sederhana;
- navigation jelas;
- error message mudah dipahami.

---

## 15. Warga Area

Minimum:

```text
/warga
/warga/profil
/warga/pengaduan/buat
/warga/pengaduan-saya
/warga/pengaduan/[id]
```

---

## 16. Kepala Lingkungan Area

Minimum:

```text
/petugas/lingkungan
/petugas/lingkungan/pengaduan
/petugas/lingkungan/pengaduan/[id]
```

Rules:

- seluruh query complaint selalu scoped berdasarkan `lingkungan_id`;
- authorization server-side;
- jangan mengandalkan hidden field atau route parameter sebagai sumber hak akses.

---

## 17. Lurah Area

Minimum:

```text
/petugas/lurah
/petugas/lurah/pengaduan
/petugas/lurah/pengaduan/[id]
/petugas/lurah/pengumuman
/petugas/lurah/statistik
```

---

## 18. Petugas Login

Satu credentials sign-in flow dapat digunakan oleh petugas lalu melakukan role-aware redirect:

```text
warga → /warga
kepala_lingkungan → /petugas/lingkungan
lurah → /petugas/lurah
```

Tidak wajib mempertahankan route `/login-admin` dari arsitektur Laravel lama.

---

## 19. Announcement Module

Lurah-side staff dapat:

- create;
- update;
- delete;
- pin/unpin;
- upload PDF;
- publish/unpublish.

Pengunjung dapat:

- list;
- detail;
- open/download PDF publik.

File validation minimum:

- MIME/type PDF;
- size limit;
- safe storage;
- original filename tidak dijadikan path tepercaya;
- file private tidak dapat diakses dengan menebak URL.

---

## 20. PWA

Minimum:

- manifest;
- icon 192x192;
- icon 512x512;
- theme color;
- standalone display;
- service worker;
- installability checks;
- offline fallback aman.

Caching rules:

- cache public static assets;
- jangan cache dashboard petugas sebagai public cache;
- jangan cache response berisi data privat secara global;
- gunakan cache versioning;
- sediakan update strategy.

---

## 21. WhatsApp

Floating WhatsApp CTA boleh digunakan untuk nomor layanan resmi kelurahan.

Requirement:

- satu nomor layanan resmi yang diberikan kelurahan;
- jangan menampilkan nomor WhatsApp warga;
- optional prefilled message;
- bukan kanal tracking pengaduan internal.

---

## 22. Security Requirements

Minimum:

- server-side authorization;
- server-side validation;
- secure session management;
- secrets di environment variables;
- `.env`/`.env.local` tidak di-commit;
- database constraints;
- upload validation;
- safe file paths;
- audit trail;
- generic auth error messages;
- secure headers/CSP sesuai kebutuhan deployment;
- jangan log secret, token OAuth, password, atau data sensitif.

---

## 23. Testing Strategy

Testing dilakukan sepanjang development.

### Authentication

- guest cannot access warga routes;
- warga cannot access petugas routes;
- kepala lingkungan tidak dapat membaca lingkungan lain;
- warga tidak dapat melihat complaint warga lain;
- Lurah dapat melihat complaint dalam scope Lurah.

### Complaint

- valid submission;
- invalid input;
- invalid file;
- duplicate/parallel ticket generation;
- correct environment routing;
- correct state transition.

### Rating

- wrong owner;
- unfinished complaint;
- duplicate rating;
- invalid score.

### Public

- unpublished complaint absent from public list;
- public page contains no private identity fields;
- evidence file is not public.

### PWA

- manifest valid;
- service worker registered;
- offline public fallback;
- no private cache leakage.

---

## 24. Seed Data

Development seed:

- 1 Lurah;
- 8 Kepala Lingkungan;
- beberapa warga dummy;
- 8 master lingkungan;
- pengumuman dummy;
- complaints untuk semua status;
- complaints published/unpublished;
- complaints with/without rating;
- audit logs.

Gunakan data dummy, bukan data warga nyata.

---

## 25. Definition of Done

Sebuah modul dianggap selesai hanya jika:

1. requirement dipenuhi;
2. authorization benar;
3. validation benar;
4. UI bekerja pada mobile;
5. error state tersedia;
6. database constraint relevan tersedia;
7. test/verification dijalankan;
8. production build lulus;
9. perubahan terdokumentasi;
10. tidak merusak modul sebelumnya.

---

## 26. Scope Boundary

### In scope

- public profile/information;
- announcements;
- warga OAuth;
- warga profile/username;
- complaint submission;
- 8 neighborhoods;
- head-of-neighborhood verification;
- forwarding to Lurah;
- Lurah processing;
- public sanitized publication;
- rating;
- audit logs;
- PWA;
- WhatsApp CTA;
- deployment.

### Out of scope

- Camat dashboard;
- Kecamatan workflow;
- escalation automation to Camat;
- city/district government integration;
- SMS gateway;
- complex GIS/map reporting;
- real-time chat;
- payment;
- e-signature;
- NIK integration.

---

## 27. 9-Day Development Target

### Day 1
Bootstrap Next.js + TypeScript + Tailwind + environment + PostgreSQL + Prisma.

### Day 2
Database schema + seed + base layout + public pages skeleton.

### Day 3
Auth.js + Google/Facebook warga + credentials petugas + roles + authorization.

### Day 4
Announcement module.

### Day 5
Citizen complaint submission + routing to neighborhood + ticket generator.

### Day 6
Head-of-neighborhood dashboard + verification + forwarding + Lurah dashboard.

### Day 7
Lurah response/status + public publication + public complaint list + rating.

### Day 8
PWA + WhatsApp + accessibility/mobile refinement.

### Day 9
Integration tests + security review + seed finalization + deployment + SOP handover.

---

## 28. Future Extensions

Possible later:

- Camat/Kecamatan layer;
- escalation workflow;
- SLA/deadline tracking;
- notification email/WhatsApp;
- analytics per category/location;
- attachment moderation;
- public information dashboard;
- service performance reports.

These are future scope, not Day-1 requirements.

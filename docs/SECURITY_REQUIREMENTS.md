# SIPP V2 — Security Requirements

## Authentication
Warga menggunakan Google OAuth. Admin menggunakan credentials internal yang di-seed developer.

## Authorization
Authorization wajib server-side. Guest hanya public; Warga hanya resource personal; Admin dapat mengelola complaint, CMS, dan announcement dalam scope kelurahan.

## Complaint privacy
Jangan expose email, nomor telepon, OAuth IDs, private media key/path, internal notes, audit log privat, dan raw private fields ke public.

## Input validation
Gunakan validation server-side. Validasi string length, enum, slug, URL, rich text/HTML jika ada, serta file upload.

## File upload
Validasi MIME + extension + size. Gunakan storage key acak/non-guessable. File private tidak boleh public-by-default.

## XSS/injection
Sanitize user-generated content jika HTML/rich text digunakan. Jangan render raw HTML tanpa sanitization. Gunakan query parameterized/ORM.

## Rate limiting / abuse
Rate limit auth, complaint creation, dan upload. Pertimbangkan honeypot/anti-bot. Jangan hanya mengandalkan IP.

## Secrets
API keys, OAuth secret, dan production credentials harus melalui environment secrets. Jangan commit `.env` atau secret ke Git.

## PWA caching
Response privat Warga/Admin tidak boleh masuk public/static cache tanpa boundary yang aman.

## Auditability
Perubahan status/priority/respons penting harus masuk ComplaintLog.

# SIPP V2 — Refactor Guide

SIPP V2 tidak wajib dibuat di repository/folder baru. Gunakan repository SIPP lama dan lakukan major refactor dengan Git safety.

## Prosedur
1. Commit checkpoint SIPP V1.
2. Tag `sipp-v1-before-refactor`.
3. Buat branch `sipp-v2`.
4. Audit read-only.
5. Klasifikasikan reusable vs obsolete.
6. Rencanakan database migration/reset.
7. Refactor bertahap.
8. Verify tiap gate.

## Aturan
- Jangan hapus seluruh legacy code sebelum audit.
- Reuse asset/UI yang aman.
- Jangan reuse business logic lama jika semantik V2 berbeda.
- Jangan membuat database destructive migration tanpa rencana dan persetujuan.

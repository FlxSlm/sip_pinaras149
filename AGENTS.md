# SIPP V2 — AGENTS.md

## Mission
Mengembangkan SIPP (Sistem Informasi Peduli Pinaras) menjadi PWA portal informasi kelurahan + pengaduan warga yang aman, dinamis, dan production-minded.

## Source of Truth
Baca file berikut sebelum implementasi yang relevan:
- `docs/PROJECT_REQUIREMENTS.md`
- `docs/ROLE_PERMISSION_MATRIX.md`
- `docs/DATABASE_DESIGN.md`
- `docs/SECURITY_REQUIREMENTS.md`
- `docs/NOTIFICATION_SPEC.md`
- `docs/CMS_SPEC.md`
- `docs/ACCEPTANCE_CRITERIA.md`
- `docs/SIPP_PINARAS_MASTER_DATA.md`
- `docs/REFACTOR_GUIDE.md`

Jika dokumen lama di repository bertentangan dengan dokumen V2 di atas, jangan diam-diam memilih salah satunya. Gunakan dokumen V2 sebagai target requirement dan laporkan konflik/risikonya sebelum perubahan besar.

## Authentication
- WARGA: Google OAuth only.
- ADMIN_KELURAHAN: application credentials only.
- Admin accounts are seeded by developer.
- No admin self-registration.
- Warga has no SIPP password.
- Never add a password-change UI for Google-authenticated warga.

## Roles
Exactly two database roles:
- `WARGA`
- `ADMIN_KELURAHAN`

Guest/public is not a database role.

## Complaint
Status:
- `MENUNGGU`
- `DIPROSES`
- `SELESAI`
- `DITOLAK`

Priority:
- `NORMAL`
- `PERLU_PERHATIAN`

Status and priority are separate. `MENUNGGU` means the complaint has not yet been opened/responded to by admin.

## Public privacy
Never expose publicly:
- reporter email
- reporter phone
- OAuth/provider IDs
- private evidence path/storage key
- internal notes
- private audit data
- raw private complaint fields

Only intentionally published/sanitized projections may be shown publicly.

## Pinaras data integrity
- Never invent Pinaras facts.
- Never attribute district-wide Tomohon Selatan data to Pinaras.
- Preserve source year/provenance.
- Do not silently correct source inconsistencies.
- Missing data must remain null/placeholder and be reported for verification.

## Coding behavior
1. Read relevant docs first.
2. Inspect the current repository before refactor.
3. Plan before changing multiple files.
4. Work incrementally.
5. Do not modify unrelated modules.
6. Do not silently introduce roles.
7. Do not silently change schema semantics.
8. Explain destructive migrations before applying them.
9. Enforce authorization server-side.
10. Validate input server-side.
11. Test data ownership.
12. Never commit secrets.
13. Run lint/typecheck/tests/build after meaningful changes.
14. Do not claim completion without real verification.

## Required workflow
READ → PLAN → IMPLEMENT → VERIFY → REPORT

## Refactor rule
Prefer:
AUDIT → REUSE SAFE PARTS → REPLACE OBSOLETE PARTS → MIGRATE DATA CAREFULLY → VERIFY

Do not delete the entire legacy codebase before an audit.

## Report
After implementation, report:
- files created/changed
- migrations
- tests added/changed
- commands run
- actual verification results
- unresolved risks

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SIP — Agent Instructions

SIP is a community-service complaint and information system for Kelurahan Pinaras.

Before coding, read:

- `PROJECT_SPEC.md`
- `AI_RULES.md`
- `DATABASE_DESIGN.md`
- `DEVELOPMENT_ROADMAP.md`

## Non-negotiable architecture

- Next.js App Router
- TypeScript
- React 19.x
- PostgreSQL
- Prisma 7.x
- Auth.js
- Tailwind CSS
- Zod

## Business workflow

```text
Warga
  ↓
Kepala Lingkungan
  ↓
Lurah
```

Camat and higher levels are outside current scope.

## Roles

```text
warga
kepala_lingkungan
lurah
```

## Core security rules

A Kepala Lingkungan may access only complaints belonging to their environment.

A warga may only access their own private complaints.

Public pages may only expose published/sanitized complaint information.

OAuth provider identity must not be replaced by editable SIP username.

## Development behavior

- Work in small increments.
- Do not big-bang the whole app.
- Verify every meaningful change.
- Do not claim completion without testing.
- Do not silently change foundational architecture.
- Keep documentation synchronized with schema/workflow changes.

## Before final response for any coding task

Report:

- what changed;
- why it changed;
- tests/checks run;
- result;
- remaining limitations.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

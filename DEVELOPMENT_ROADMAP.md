# SIP — Development Roadmap v3.0

## Development principle

The 9-day target is a delivery target, not permission to skip verification.

Every day ends with a working, testable increment.

## Day 1 — Foundation

Goal: clean Next.js project that runs locally.

Tasks:

- Next.js 16.x + TypeScript;
- Tailwind;
- PostgreSQL;
- Prisma;
- `.env.local`;
- project docs;
- lint/typecheck;
- simple base layout.

Exit criteria:

```text
npm run dev
npm run lint
npm run build
```

pass.

## Day 2 — Database + Public Skeleton

Goal: domain model and public shell exist.

Tasks:

- Prisma schema;
- migrations;
- seed 8 environments, 1 Lurah, 8 Kepala Lingkungan, sample warga;
- public navigation;
- home/profile/services;
- announcement shell;
- public complaint shell.

Exit criteria:

- migration works;
- seed works;
- pages render on mobile;
- no private complaint data is publicly serialized.

## Day 3 — Authentication + Authorization

Goal: all roles authenticate through intended mechanisms.

Tasks:

- Auth.js;
- Google;
- credentials for petugas;
- role-aware session;
- protected route boundaries;
- default SIP username;
- editable username;
- role redirects.

Critical tests:

- guest blocked from warga pages;
- warga blocked from petugas pages;
- neighborhood isolation;
- username change does not alter OAuth identity.

## Day 4 — Announcement

Goal: Lurah-side announcement management works.

Tasks:

- CRUD;
- slug;
- pin;
- publish/unpublish;
- PDF validation/storage;
- public list/detail;
- PDF access rules.

## Day 5 — Citizen Complaint

Goal: warga can submit complaints.

Tasks:

- complaint form;
- environment selection;
- category/title/description;
- evidence image;
- phone collection if required by final policy;
- concurrency-safe ticket generator;
- initial `DIAJUKAN`;
- initial `DRAFT` publication;
- complaint log.

## Day 6 — Internal Workflow

Goal: Kepala Lingkungan and Lurah workflows work.

Kepala Lingkungan:

- own-environment inbox;
- detail;
- verify;
- internal note;
- forward.

Lurah:

- all relevant forwarded complaints;
- detail;
- status;
- official response;
- outside-authority state.

Exit criteria:

- neighborhood isolation passes;
- Lurah sees forwarded complaints;
- status transitions enforced server-side;
- logs written.

## Day 7 — Public Publication + Rating

Goal: transparency and satisfaction measurement work.

Tasks:

- publication control;
- public complaint list;
- sanitized public detail;
- status filters;
- rating 1–5;
- eligibility;
- aggregate stats.

Exit criteria:

- unpublished complaints absent publicly;
- no reporter identity leak;
- rating ownership/finished-state rules pass;
- double rating blocked.

## Day 8 — PWA + UX

Goal: mobile-first production-like experience.

Tasks:

- manifest;
- icons;
- service worker;
- offline fallback;
- installability checks;
- safe cache strategy;
- WhatsApp CTA;
- accessibility/mobile audit.

## Day 9 — Hardening + Delivery

Goal: demonstrable and deployable system.

Tasks:

- integration tests;
- edge cases;
- security review;
- seed cleanup;
- environment checklist;
- production build;
- deployment;
- backup/rollback notes;
- handover SOP.

Final acceptance:

```text
lint
typecheck
test
build
manual smoke test
production smoke test
```

All must pass or explicit exceptions must be documented.

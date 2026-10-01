# SIP — AI Prompt Playbook

Use these prompts sequentially with the coding agent.

## Prompt 0 — Project Intake / Audit

Read:

- `PROJECT_SPEC.md`
- `AI_RULES.md`
- `DATABASE_DESIGN.md`
- `DEVELOPMENT_ROADMAP.md`
- `AGENTS.md` if present.

Do not implement features yet.

Inspect the repository and report:

1. framework/version;
2. Node version;
3. package manager;
4. dependencies;
5. database configuration;
6. directory structure;
7. build status;
8. conflicts with specification.

Propose only the smallest safe next step.

## Prompt 1 — Bootstrap

Implement only project foundation:

- Next.js 16.x;
- TypeScript;
- Tailwind;
- PostgreSQL;
- Prisma 7.x;
- base layout;
- lint/typecheck/build;
- `.env.example`.

Do not implement authentication, complaints, rating, or announcements.

Verify with `npm run lint` and `npm run build`.

## Prompt 2 — Database

Read `DATABASE_DESIGN.md`.

Implement:

- User;
- Lingkungan;
- Complaint;
- ComplaintLog;
- Announcement;
- Auth.js adapter schema as required.

Create migration and seed:

- 8 environments;
- 1 Lurah;
- 8 Kepala Lingkungan;
- sample warga.

Do not implement dashboards.

Verify migration and seed from a clean development database.

## Prompt 3 — Authentication

Implement Auth.js using:

- Google;
- credentials for staff.

Roles:

- warga;
- kepala_lingkungan;
- lurah.

Implement:

- role-aware session;
- protected routes;
- login UI;
- logout;
- safe errors.

For warga:

- initial SIP username from provider nickname if available, otherwise normalized name;
- uniqueness;
- editable username.

Do not implement complaint workflow in this task.

## Prompt 4 — Complaint Creation

Implement only citizen complaint submission.

Requirements:

- authenticated warga only;
- select one environment;
- title;
- category;
- description;
- optional evidence photo;
- validate phone if required by final form policy;
- concurrency-safe ticket number;
- initial `DIAJUKAN`;
- initial publication `DRAFT`;
- audit log.

Security:

- never accept reporter ID as authority;
- never trust hidden environment fields;
- validate upload.

Test unauthorized, valid, invalid-input, invalid-file, and ticket concurrency behavior.

## Prompt 5 — Head of Neighborhood Workflow

Implement only the `kepala_lingkungan` workflow.

Rules:

- staff sees only complaints from their own environment;
- can view authorized detail;
- can verify;
- can add internal note;
- can forward to Lurah;
- cannot mark complete.

Every transition creates a ComplaintLog.

Do not change public publication behavior.

## Prompt 6 — Lurah Workflow

Implement only the Lurah workflow.

Lurah can:

- see forwarded complaints;
- see necessary full detail;
- add official response;
- set `DALAM_PROSES`;
- set `SELESAI`;
- set `DI_LUAR_KEWENANGAN`.

Every significant action creates a log.

Do not expose internal data through public routes.

## Prompt 7 — Public Publication

Implement:

- public complaint list;
- public filters;
- sanitized public detail;
- publication control.

Public endpoint must never return:

- reporter identity;
- phone;
- email;
- provider IDs;
- evidence path;
- internal note.

Only published complaints are public.

Prove the rule with tests.

## Prompt 8 — Rating

Eligibility:

```text
authenticated warga
AND complaint.owner === currentUser
AND status === SELESAI
AND rating === null
```

Rating:

```text
1..5 integer
```

Save:

- rating;
- rated_at;
- audit log.

Public stats:

- total voters;
- average to one decimal.

Test wrong owner, unfinished complaint, duplicate rating, invalid score.

## Prompt 9 — PWA

Implement:

- manifest;
- icons;
- service worker;
- public cache strategy;
- offline fallback.

Do not cache private authenticated responses in a shared public cache.

Verify installability and public offline behavior.

## Prompt 10 — Final Audit

Do a read-only audit first.

Check:

- role boundaries;
- data leaks;
- file exposure;
- route exposure;
- validation;
- ticket uniqueness;
- status transitions;
- publication logic;
- rating ownership;
- PWA caching;
- environment secrets;
- build;
- tests.

Then provide a prioritized issue list.

Only after the audit should fixes be implemented.

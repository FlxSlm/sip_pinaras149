# SIP — AI Coding Rules

These rules are mandatory for any AI coding agent working on SIP.

## 1. Source of Truth

Read these files before making non-trivial changes:

1. `PROJECT_SPEC.md`
2. `AI_RULES.md`
3. `DATABASE_DESIGN.md`
4. `DEVELOPMENT_ROADMAP.md`
5. `AGENTS.md` if present.

When project code and documentation conflict:

- inspect the current code;
- identify the conflict;
- do not silently rewrite architecture;
- explain the conflict before changing foundational behavior.

## 2. Scope Control

Do not implement unrelated features.

Do not add:

- Camat role;
- Kecamatan workflow;
- complex GIS;
- real-time chat;
- payments;
- NIK;
- unnecessary API layers;
- unnecessary microservices;

unless explicitly requested.

## 3. Vibe Coding Protocol

For each feature:

```text
Understand
→ Plan
→ Implement
→ Verify
→ Report
```

Before coding a non-trivial feature, briefly state:

- files likely affected;
- data/model changes;
- authorization implications;
- tests/verification to run.

Then implement only the agreed scope.

## 4. Never Big-Bang Code

Never create the entire application in one step.

Work module-by-module:

1. foundation;
2. database;
3. authentication;
4. announcements;
5. complaints;
6. internal workflow;
7. rating/publication;
8. PWA;
9. testing/deployment.

## 5. Preserve Architecture

Preferred architecture:

- Next.js App Router;
- TypeScript;
- server-first where practical;
- Prisma for database access;
- Auth.js for authentication;
- Zod for validation;
- PostgreSQL.

Do not introduce another framework or ORM without a clear technical reason.

## 6. Server Is the Security Boundary

Never trust:

- hidden form fields;
- query parameters;
- route IDs;
- client-side role checks;
- client-side ownership checks;
- client-side validation alone.

Every sensitive operation must re-check authorization on the server.

## 7. Role Rules

Roles:

```text
warga
kepala_lingkungan
lurah
```

Never use a generic `admin` role for business authorization when a specific role is available.

## 8. Neighborhood Isolation

A `kepala_lingkungan` user can access only complaints where:

```text
complaint.lingkungan_id === currentUser.lingkungan_id
```

Do not use UI filtering as the only protection.

## 9. Citizen Ownership

A warga can access private complaint data only when:

```text
complaint.reporter_user_id === currentUser.id
```

Never expose another citizen's private complaint data.

## 10. Public Data

Public pages must use a deliberately constructed public view model/DTO.

Do not serialize a full ORM user/complaint object to a public page.

Never expose:

- reporter name;
- email;
- phone;
- provider IDs;
- access/refresh tokens;
- internal notes;
- private file paths;
- private descriptions.

## 11. OAuth Identity

Provider IDs belong to the authentication identity layer.

SIP username is a user-editable application identity.

Do not use username as the OAuth binding key.

Username initial value:

1. provider nickname if actually available;
2. otherwise normalized display name;
3. add a safe collision suffix if required.

## 12. Validation

All user-controlled input must be validated server-side.

For uploads:

- validate MIME/type;
- validate extension;
- validate size;
- generate safe stored filename/path;
- do not trust original filename.

For rating:

```text
integer
1..5
```

For username:

- normalization;
- uniqueness;
- reserved-word check;
- safe character set.

## 13. Database Integrity

Use database-level constraints where appropriate:

- unique username;
- unique ticket number;
- valid relations;
- rating range where supported;
- role values;
- environment relations.

Do not rely entirely on application-level checks.

## 14. Ticket Number

Never generate ticket numbers using:

```text
count(*) + 1
```

without concurrency protection.

Use a transaction/locking/counter strategy.

## 15. Status Transitions

Valid statuses:

```text
DIAJUKAN
DIVERIFIKASI
DITERUSKAN_KE_LURAH
DALAM_PROSES
SELESAI
DI_LUAR_KEWENANGAN
```

Do not allow arbitrary transitions from the client.

## 16. Publication

Do not assume:

```text
SELESAI === PUBLIC
```

Publication is a separate decision.

Default for a new complaint:

```text
unpublished
```

Public rendering must use sanitized public data.

## 17. Audit Trail

Important state changes should write an audit log:

- complaint created;
- verified;
- forwarded;
- status changed;
- response added;
- publication changed;
- rating submitted where useful.

Do not allow normal UI users to edit/delete audit history.

## 18. Authentication Errors

Do not reveal whether a particular account exists through overly specific error messages.

Use safe user-facing messages; keep technical diagnostics in server logs.

Never log:

- passwords;
- OAuth secrets;
- access tokens;
- refresh tokens;
- session tokens.

## 19. Secrets and Environment

Never hard-code secrets.

Use:

```text
.env.local
```

or the deployment platform's secret manager.

Never commit secrets.

Update example env files with placeholders only.

## 20. PWA Caching

Never cache authenticated/private responses into a shared public cache.

Public static assets may be cached.

Use cache versioning and safe update handling.

## 21. UI/UX Rules

SIP is intended for broad public use, including older users.

Prefer:

- large touch targets;
- clear primary actions;
- high contrast;
- obvious feedback;
- concise Indonesian wording;
- predictable navigation;
- simple forms;
- descriptive validation messages.

Avoid:

- cluttered dashboards;
- excessive animation;
- tiny controls;
- icon-only essential actions without labels.

## 22. Accessibility

Use:

- semantic HTML;
- labels for inputs;
- keyboard access;
- visible focus states;
- accessible error messages;
- sufficient contrast;
- alt text for meaningful images.

## 23. Error Handling

Every major action needs:

- loading state;
- success state;
- validation error state;
- unexpected error state.

Do not show raw stack traces to users.

## 24. Testing

After each meaningful module:

- run lint/type checks;
- run relevant automated tests;
- run build when appropriate;
- perform a focused manual smoke test.

Do not claim a module is complete without verification.

## 25. Change Reporting

After implementation report:

```text
Changed files
Database changes
Commands run
Tests/checks
Result
Known limitations
```

Keep the report factual.

## 26. No Silent Refactors

Do not rename major directories, replace libraries, or restructure authentication/database layers during a feature task unless required.

If required, explain why.

## 27. Agent Output Quality

Do not produce fake completion.

Never say:

> "Feature completed"

when only UI mockups exist.

Distinguish:

- scaffolded;
- partially implemented;
- implemented;
- tested;
- production-ready.

## 28. Documentation Maintenance

When changing:

- route;
- role;
- schema;
- workflow;
- security rule;

update the corresponding project documentation in the same task or explicitly flag documentation as pending.

## 29. Minimal Prompt Compliance

If the user asks for one feature, implement that feature and its necessary supporting code only.

Do not use the task as an excuse to rebuild unrelated modules.

## 30. Final Verification Rule

Before declaring the current stage done:

```text
npm run lint
npm run build
```

and any relevant test command must pass, or the agent must clearly report why it could not be run and what remains unresolved.

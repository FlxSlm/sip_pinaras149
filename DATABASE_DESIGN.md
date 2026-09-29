# SIP — Database Design v3.0

## 1. Database

Primary database:

```text
PostgreSQL
```

ORM:

```text
Prisma ORM 7.x
```

Use relational integrity and database constraints.

---

## 2. Core Entities

```text
User
  │
  ├── owns many Complaints
  ├── creates many ComplaintLogs
  └── may belong to one Lingkungan (for Kepala Lingkungan)

Lingkungan
  │
  └── has many Complaints

Complaint
  │
  ├── belongs to User (reporter)
  ├── belongs to Lingkungan
  └── has many ComplaintLogs

Announcement
  │
  └── created/managed by Lurah-side staff

Auth.js Adapter Entities
  │
  ├── Account
  ├── Session
  └── related auth tables as required
```

## 3. User

Conceptual fields:

```text
id
username
name
email
phone
role
lingkungan_id nullable
created_at
updated_at
```

Roles:

```text
warga
kepala_lingkungan
lurah
```

Only `kepala_lingkungan` requires a current `lingkungan_id`.

## 4. Lingkungan

Fields:

```text
id
name
code
active
created_at
updated_at
```

Constraints:

- code unique;
- seeded with 8 official environments;
- names must come from official interview/document data.

## 5. Complaint

Suggested fields:

```text
id
reporter_user_id
lingkungan_id
ticket_number
title
category
description
evidence_path
handling_status
internal_note
official_response
responded_at
rating
rated_at
publication_status
published_at
created_at
updated_at
```

Handling status:

```text
DIAJUKAN
DIVERIFIKASI
DITERUSKAN_KE_LURAH
DALAM_PROSES
SELESAI
DI_LUAR_KEWENANGAN
```

Publication status:

```text
DRAFT
PUBLISHED
```

Rating: nullable integer 1–5.

## 6. Complaint Log

Fields:

```text
id
complaint_id
actor_user_id nullable
action
from_status nullable
to_status nullable
note nullable
created_at
```

Examples:

```text
CREATED
VERIFIED
FORWARDED_TO_LURAH
STATUS_CHANGED
RESPONSE_ADDED
PUBLISHED
UNPUBLISHED
RATED
```

## 7. Announcement

Fields:

```text
id
title
slug
content
pdf_path nullable
is_pinned
published
created_by
created_at
updated_at
```

## 8. Authentication Tables

Jika Auth.js memakai database adapter, gunakan schema adapter resmi/supported untuk User, Account, Session, dan entitas terkait.

Jangan membuat provider identity duplikatif tanpa kebutuhan.

## 9. Indexing

Recommended indexes:

### Complaint

```text
reporter_user_id
lingkungan_id
handling_status
publication_status
created_at
ticket_number (unique)
```

### ComplaintLog

```text
complaint_id
actor_user_id
created_at
```

### User

```text
username (unique)
role
lingkungan_id
```

## 10. Integrity Rules

Database should enforce where practical:

- unique username;
- unique ticket number;
- valid foreign keys;
- valid rating range;
- valid role values;
- unique announcement slug.

Application logic must additionally enforce:

- role authorization;
- ownership;
- state transitions;
- publication rules.

## 11. Ticket Number Strategy

Required format:

```text
LPR-YYYYMM-###
```

Recommended logic:

1. derive period key;
2. acquire concurrency-safe sequence;
3. generate next value;
4. insert complaint in transaction;
5. rely on unique constraint as final guard.

Never use naïve `count() + 1`.

## 12. Privacy Model

Public complaint access requires:

```text
publication_status = PUBLISHED
```

But only a public projection/DTO may be returned.

Private raw data remains limited to authorized roles.

## 13. Authorization Queries

### Warga

```text
reporter_user_id = currentUser.id
```

### Kepala Lingkungan

```text
lingkungan_id = currentUser.lingkungan_id
```

### Lurah

All complaints within SIP scope and appropriate workflow state.

### Public

```text
publication_status = PUBLISHED
```
plus a safe field projection.

## 14. Naming Direction

Suggested code-level names:

```text
User
Lingkungan
Complaint
ComplaintLog
Announcement
```

UI can use Indonesian labels:

```text
Warga
Kepala Lingkungan
Lurah
Pengaduan
Pengumuman
```

## 15. Migration Rules

Every schema change must:

1. update Prisma schema/contract;
2. create migration;
3. update seed if necessary;
4. update documentation;
5. run migration locally;
6. run relevant tests.

Do not manually edit production schema as the normal workflow.

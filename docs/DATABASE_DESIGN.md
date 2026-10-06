# SIPP V2 — Database Design

## Prinsip
Gunakan schema sederhana, eksplisit, dan mudah diaudit. Status penanganan dan priority harus terpisah.

## Entitas inti

### User
- id
- role (`WARGA | ADMIN_KELURAHAN`)
- name
- email
- username jika diperlukan
- profile_image_url
- password_hash (admin; warga nullable)
- created_at
- updated_at

Provider Google warga dikelola melalui tabel adapter/session Auth.js yang sesuai. Provider account ID bukan username.

### Complaint
- id
- ticket_number unique
- reporter_user_id
- category
- title
- description
- location
- status
- priority
- response/note fields sesuai model final
- publication reference/field bila publikasi complaint diaktifkan
- created_at
- updated_at
- opened_at
- responded_at
- completed_at
- rejected_at

### ComplaintLog
- id
- complaint_id
- actor_user_id
- action
- old_status
- new_status
- old_priority
- new_priority
- note
- created_at

### Notification
- id
- recipient_user_id
- type
- title
- message
- read_at
- related_entity_type
- related_entity_id
- created_at

### Announcement
- id
- title
- slug
- content
- media_type (`TEXT | PDF | VIDEO`)
- media_id/storage reference
- status (`DRAFT | PUBLISHED | ARCHIVED`)
- published_at
- created_by
- updated_at

### KelurahanContent
Untuk profil, hero, sejarah, visi-misi, kontak, section config, dan konten dinamis lain yang memang membutuhkan CMS.

### Potential
- id
- title
- description
- image/media
- sort_order
- published
- source_note

### Facility
- id
- name
- type
- description
- address nullable
- image/media nullable
- published
- source_note

### Gallery / Media
- id
- storage_key
- mime_type
- size_bytes
- caption
- credit
- uploaded_by
- created_at

File binary sebaiknya disimpan pada object/file storage; database menyimpan metadata dan referensi.

## Provenance
Statistik Pinaras berbasis BPS sebaiknya menyimpan:
- source
- source_table
- source_year
- source_page
- verified_at

## Data integrity
- ticket number unique
- foreign keys valid
- enum valid
- jangan hapus complaint log yang dibutuhkan untuk audit
- password tidak plaintext

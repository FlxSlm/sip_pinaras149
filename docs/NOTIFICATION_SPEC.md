# SIPP V2 — Notification Specification

## Prinsip
Notification adalah resource personal. User hanya melihat notifikasi miliknya sendiri.

## Warga triggers
- complaint berhasil dibuat
- complaint dibuka/diperhatikan
- priority ditetapkan bila relevan
- status DIPROSES
- status SELESAI
- status DITOLAK
- tanggapan/catatan admin tersedia
- pengumuman publik baru
- aktivitas akun relevan

Bell:
- unread count
- preview list
- time
- type indicator
- link ke resource terkait

Klik bell -> halaman `/notifikasi` yang menampilkan seluruh notifikasi, mendukung mark-as-read, dan link detail.

## Admin triggers
- complaint baru
- complaint priority PERLU_PERHATIAN
- aktivitas complaint penting
- backlog reminder bila nanti disetujui

## Security
Saat notification membuka related entity, server tetap melakukan authorization. Notification tidak menjadi bypass authorization.

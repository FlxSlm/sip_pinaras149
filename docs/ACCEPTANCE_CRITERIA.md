# SIPP V2 — Acceptance Criteria

## Public
- [ ] Landing page tanpa login.
- [ ] Hanya content public/published yang terlihat.
- [ ] Guest tidak dapat dashboard.
- [ ] Private complaint data tidak tampil publik.

## Warga authentication
- [ ] Google OAuth only.
- [ ] No Facebook.
- [ ] No password registration.
- [ ] No SIPP password-change UI.
- [ ] User harus login untuk membuat complaint.

## Admin authentication
- [ ] Credential login.
- [ ] Account seeded by developer.
- [ ] No self-registration.
- [ ] No Google login.
- [ ] Password hash.
- [ ] Admin dapat ganti password.

## Complaint
- [ ] Complaint baru MENUNGGU.
- [ ] Admin membuka complaint.
- [ ] Priority wajib dipilih: NORMAL/PERLU_PERHATIAN.
- [ ] Admin dapat memberi note/response.
- [ ] Status sesuai transition rules.
- [ ] MENUNGGU + DIPROSES -> queue tindak lanjut.
- [ ] SELESAI + DITOLAK -> queue selesai.
- [ ] Ticket unique.
- [ ] Ownership tests pass.
- [ ] ComplaintLog mencatat aktivitas penting.

## Warga dashboard
- [ ] History hanya milik user.
- [ ] Inbox-like UI.
- [ ] Detail complaint.
- [ ] Profile photo.
- [ ] Notification bell + unread count.
- [ ] Full notification page.
- [ ] Interactive chart Selesai/Diproses/Menunggu/Ditolak.

## Admin dashboard
- [ ] Queue tindak lanjut.
- [ ] Queue selesai.
- [ ] Response/status/priority.
- [ ] Status chart.
- [ ] Priority chart.
- [ ] Notification bell + page.
- [ ] Announcement/CMS/profile.

## Announcement
- [ ] Text note.
- [ ] PDF.
- [ ] Video.
- [ ] Draft not public.
- [ ] Published appears public.
- [ ] File validation.

## CMS
- [ ] Hero/profile/statistics/potential/facilities/gallery/contact/map manageable by admin as defined.
- [ ] Changes visible without redeploy.
- [ ] Missing official data remains placeholder/null.

## Security
- [ ] Server-side authorization.
- [ ] Warga A cannot access Warga B data.
- [ ] Guest cannot call private APIs.
- [ ] Admin endpoints reject Warga.
- [ ] Private media not public by default.
- [ ] Upload/input validation pass.
- [ ] PWA cache does not leak private data.

## PWA/UX
- [ ] Manifest.
- [ ] Installability target met.
- [ ] Responsive.
- [ ] Safe offline fallback.
- [ ] Visual identity emphasizes Tomohon/Pinaras natural scenery.

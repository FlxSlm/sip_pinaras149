# SIPP V2 — Role & Permission Matrix

`PUBLIC/GUEST` adalah kondisi akses tanpa autentikasi, bukan role database.

| Capability | Guest | Warga | Admin Kelurahan |
|---|---:|---:|---:|
| Melihat landing page | ✅ | ✅ | ✅ |
| Melihat konten publik | ✅ | ✅ | ✅ |
| Melihat pengumuman publik | ✅ | ✅ | ✅ |
| Mengakses dashboard warga | ❌ | ✅ | ❌ |
| Mengakses dashboard admin | ❌ | ❌ | ✅ |
| Membuat pengaduan | ❌ | ✅ | ❌ |
| Melihat pengaduan sendiri | ❌ | ✅ | ❌ |
| Melihat seluruh pengaduan operasional | ❌ | ❌ | ✅ |
| Mengubah status pengaduan | ❌ | ❌ | ✅ |
| Menentukan priority | ❌ | ❌ | ✅ |
| Memberi catatan/tanggapan admin | ❌ | ❌ | ✅ |
| Membuat pengumuman | ❌ | ❌ | ✅ |
| Publish/unpublish pengumuman | ❌ | ❌ | ✅ |
| Mengelola konten landing page | ❌ | ❌ | ✅ |
| Mengelola galeri/media | ❌ | ❌ | ✅ |
| Melihat notifikasi pribadi | ❌ | ✅ | ✅ |
| Mengganti foto profil sendiri | ❌ | ✅ | ✅ |
| Mengganti password | ❌ | ❌ | ✅ |

## Ownership
- Warga hanya boleh mengakses resource miliknya sendiri.
- Admin mengelola resource operasional/CMS dalam scope kelurahan.
- Authorization harus ditegakkan di server.

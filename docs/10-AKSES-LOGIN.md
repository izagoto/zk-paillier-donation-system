# Akses dan Login

Dokumen ini menjelaskan **siapa boleh mengakses apa** pada prototipe **TrustGive** (frontend + API).

## Ringkasan

| Peran | Login? | Akses di aplikasi web |
|---|---|---|
| **Pengunjung** | Tidak | Beranda, daftar campaign, detail campaign (baca saja) |
| **Pengguna terdaftar** | Ya (JWT) | Semua akses pengunjung + buat campaign, donasi, generate proof |
| **Publik internet** | — | Tidak ada; hanya lingkungan demo lokal/penelitian |

Tidak ada halaman **Daftar** di UI. Akun hanya dibuat oleh **pengelola penelitian** melalui API bootstrap (lihat bawah).

## Siapa yang bisa login?

Setiap baris di tabel `users` (PostgreSQL) dengan email dan password yang valid **boleh login** lewat:

- Frontend: `http://localhost:5173/login`
- API: `POST /api/auth/login` → JWT `access_token`

Saat ini semua akun baru dari `POST /api/auth/register` mendapat **role `donor`** di database. Peran itu **belum** membedakan izin di API (pengelola campaign dan donatur memakai endpoint yang sama setelah login).

**Siapa yang tidak bisa login:** email yang belum pernah didaftarkan ke database.

## Membuat akun (bootstrap, bukan fitur publik)

Hanya untuk setup demo/penelitian. Backend harus berjalan (`go run ./cmd/server`).

```bash
# Akun pengelola / donatur demo 1
curl -s -X POST http://127.0.0.1:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"pengelola@demo.local","password":"demo12345"}'

# Akun donatur demo 2 (opsional, skenario dua pengguna)
curl -s -X POST http://127.0.0.1:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"donatur@demo.local","password":"demo12345"}'
```

Respons sukses: `201` dengan `id`, `email`, `role`. Jika email sudah ada: `409`.

**Disarankan untuk sidang/demo:** buat minimal satu akun sebelum membuka UI; gunakan kredensial di atas atau sesuaikan email/password (min. 8 karakter untuk password di UI).

## Endpoint autentikasi

| Metode | Path | Siapa | Keterangan |
|---|---|---|---|
| POST | `/api/auth/register` | Pengelola (curl/Postman) | Bootstrap akun; **tidak** ditampilkan di web |
| POST | `/api/auth/login` | Semua pengguna terdaftar | Mengembalikan JWT |
| GET | `/api/auth/me` | Bearer JWT | Profil user saat ini |

Header untuk request terproteksi:

```http
Authorization: Bearer <access_token>
```

## Fitur yang membutuhkan login

| Fitur | Login wajib? |
|---|---|
| Lihat daftar/detail campaign | Tidak |
| Buat campaign | Ya |
| Generate proof + kirim donasi | Ya |
| Lihat profil (`/api/auth/me`) | Ya |

## Keamanan (demo)

- JWT secret dari `JWT_SECRET` di `backend/.env` — jangan commit.
- Endpoint `register` terbuka di API demo; **jangan** diekspos ke internet tanpa proteksi.
- Untuk produksi: nonaktifkan `register`, gunakan provisioning terpusat, rate limiting, dan HTTPS.

Lihat juga [08-KEAMANAN.md](08-KEAMANAN.md) dan [LOCAL-SETUP.md](LOCAL-SETUP.md).

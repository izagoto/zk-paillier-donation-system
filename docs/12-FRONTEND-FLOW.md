# Alur Frontend (TrustGive)

Melengkapi [05-WORKFLOW.md](05-WORKFLOW.md) dengan rute UI dan peran.

## Peran dan rute utama

| Peran | Setelah login | Navigasi (header) |
|-------|----------------|-------------------|
| `donor` | `/donor` | Dashboard, Jelajahi campaign, Riwayat donasi, Profil |
| `organizer` | `/organizer` | Dashboard, Campaign saya, Donasi masuk, Profil |
| `auditor` | `/auditor` | Transparansi, Jelajahi campaign |
| `admin` | `/organizer` | Pengelola + menu **Rekonsiliasi**; grup **Donasi (admin)** untuk jelajahi campaign & riwayat donasi |

Registrasi hanya lewat API; UI hanya **login** ([10-AKSES-LOGIN.md](10-AKSES-LOGIN.md)).

## Alur donatur

1. Jelajahi campaign → detail → **Donasi sekarang** → `/campaigns/:id/donate` (stepper Nominal → Konfirmasi → Proses).
2. Backend: `POST /api/donations/generate-proof` lalu `POST /api/donations` dengan header `Idempotency-Key`.
3. Riwayat: `GET /api/me/donations` (kolom `amount` hanya untuk donatur yang login).
4. Bukti publik: `/verify/donation/:id` ← `GET /api/donations/:id/verify`.

## Alur pengelola

1. Buat campaign (`/campaigns/new`) — opsional: kategori, lokasi, URL gambar.
2. Kelola campaign di detail (tombol **Kelola**) — `PATCH /api/campaigns/:id` (judul, deskripsi, status `active`/`closed`, metadata).
3. Bagikan tautan campaign (tombol **Bagikan**).
4. Dashboard: grafik `GET /api/me/organizer/donation-stats?days=7`.

Filter **Campaign saya**: `?mine=1` + `created_by === user.id` di klien.

## Layout

- **Tamu:** `PublicLayout` — Beranda, Campaign, Masuk.
- **Login:** `WorkspaceLayout` — header tetap dengan nav per role, breadcrumb di `PageShell`.
- Styling: Tailwind v4 + token `tg-*` di `frontend/src/styles/tailwind.css`.

## Beranda (`/`)

Tamu melihat ringkasan campaign aktif (maks. 6) dalam panel **Campaign aktif**. Pengguna login yang membuka `/` diarahkan ke dashboard peran.

## Login

Halaman `/login` memakai layout kartu split (`AuthLayout` + `auth.css`), mark `trustgive-mark.svg`, redirect per role setelah sukses.

## API campaign (metadata)

Migration `000007`: kolom `image_url`, `category`, `location` pada tabel `campaigns`.

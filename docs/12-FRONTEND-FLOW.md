# Alur Frontend (TrustGive)

Melengkapi [05-WORKFLOW.md](05-WORKFLOW.md) dengan rute UI dan peran. Panduan layar per tombol: [21-MANUAL-BOOK.md](21-MANUAL-BOOK.md).

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
4. Bukti publik: **modal** di detail campaign (**Lihat bukti**) atau halaman `/verify/donation/:id` ← `GET /api/donations/:id/verify`.

## Alur pengelola

1. Buat campaign (`/campaigns/new`) — opsional: kategori, lokasi, URL gambar.
2. Kelola campaign di detail (tombol **Kelola**) — `PATCH /api/campaigns/:id` (judul, deskripsi, status `active`/`closed`, metadata).
3. Bagikan tautan campaign (tombol **Bagikan**).
4. Dashboard: grafik `GET /api/me/organizer/donation-stats?days=7`.

Filter **Campaign saya**: `?mine=1` + `created_by === user.id` di klien. Tab status di URL: `?mine=1&status=active` atau `status=other` (refresh mempertahankan tab).

**Buat / kelola campaign:** modal atau `/campaigns/new`; modal **Buat campaign** hanya ditutup lewat tombol **X** atau **Batal** (bukan klik backdrop / Escape).

## Jelajahi campaign (`/campaigns`)

Grid kartu dalam `DataTableCard` dengan `scrollBody="fill"` bila banyak campaign (isi kartu scroll). Sedikit hasil filter: lebar kartu dibatasi (rata kiri).

## DataTable (scroll & pagination)

| Konteks | Scroll body jika (per halaman) |
|---------|--------------------------------|
| Campaign saya | > 6 baris |
| Donasi masuk (organizer) | > 7 baris |
| Riwayat donasi (donor) | > 10 baris |
| Tab donasi / transparansi (detail) | > 5 baris |

**Tampilkan N entri** disimpan di `sessionStorage` per halaman (`dataTablePageSizeStorage.ts`). Logika ambang: `frontend/src/lib/dataTableScroll.ts`.

## Layout

- **Tamu:** `PublicLayout` — Beranda, Campaign, Masuk.
- **Login:** `WorkspaceLayout` — header tetap dengan nav per role, breadcrumb di `PageShell`.
- Styling: Tailwind v4 + token `tg-*` di `frontend/src/styles/tailwind.css`.

## Beranda (`/`)

Tamu melihat ringkasan campaign aktif (maks. 6) dalam panel **Campaign aktif**. Pengguna login yang membuka `/` diarahkan ke dashboard peran.

## Login

Halaman `/login` memakai layout kartu split (`AuthLayout` + `auth.css`), judul form **Masuk ke TrustGive**, redirect per role setelah sukses.

- Validasi klien (`noValidate` + `loginValidation.ts`): email wajib/format, kata sandi wajib — pesan Indonesia di `auth-form__alert`.
- Gagal API: pesan aman via `authMessages.ts` (satu kalimat untuk kredensial salah; tidak membedakan email terdaftar atau tidak).
- Terlalu banyak percobaan gagal: backend HTTP 429 → *Terlalu banyak percobaan masuk…*
- Keamanan server (bcrypt, rate limit per IP): [08-KEAMANAN.md](08-KEAMANAN.md), [10-AKSES-LOGIN.md](10-AKSES-LOGIN.md).

## API campaign (metadata)

Migration `000007`: kolom `image_url`, `category`, `location` pada tabel `campaigns`.

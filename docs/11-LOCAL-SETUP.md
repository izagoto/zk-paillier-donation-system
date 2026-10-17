# Menjalankan Sistem Lokal (Demo)

## Prasyarat

- Go 1.22+
- Node.js 20+
- PostgreSQL (lokal atau Docker — lihat bagian database)
- Artefak ZK di `zk/build/` (hasil compile Circom/snarkjs di mesin pengembangan)

## 1. Database

Backend **selalu** memakai `DATABASE_URL` di `backend/.env`. Itu sumber kebenaran untuk `psql` dan migrasi.

### Opsi A: PostgreSQL yang sudah ada (umum di laptop dev)

Isi `DATABASE_URL` di `backend/.env` sesuai instalasi Anda (user, password, nama DB).  
**Jangan** mengasumsikan URL dari `docker-compose.yml` / `.env.example` (`zkdonation`) jika Anda tidak memakai container itu.

### Opsi B: Docker Compose

```bash
docker compose up -d postgres
```

Lalu set di `backend/.env`:

```env
DATABASE_URL=postgres://zkdonation:zkdonation@127.0.0.1:5432/zk_donation?sslmode=disable
```

### Migrasi

```bash
cd backend
set -a && source .env && set +a   # zsh/bash: muat DATABASE_URL

migrate -path migrations -database "$DATABASE_URL" up
```

(`migrate` = [golang-migrate](https://github.com/golang-migrate/migrate) CLI)

Setelah pull terbaru, pastikan migrasi sampai **000007** (metadata campaign: gambar, kategori, lokasi).

### Data demo sidang (opsional)

Setelah ada campaign dari akun `pengelola@demo.local`:

```bash
# dari root repo (cleanup campaign uji + seed metadata + data scroll tabel)
./backend/scripts/setup_demo_presentation.sh
```

Atau manual dari folder `backend`:

```bash
psql "$DATABASE_URL" -f scripts/cleanup_demo_campaigns.sql
psql "$DATABASE_URL" -f scripts/seed_demo_presentation.sql
psql "$DATABASE_URL" -f scripts/seed_datatable_scroll.sql
```

Skrip `seed_datatable_scroll.sql` menambah **8 campaign** demo, **11 donasi** terkonfirmasi, dan **6 baris archive** (admin). **Campaign saya**: scroll **>6**; **Donasi masuk** (organizer): scroll **>7**; **Riwayat donasi** (donatur): scroll **>10**; tab detail campaign tetap **>5**. Butuh minimal satu campaign aktif milik `pengelola@demo.local`.

Akun **admin** (rekonsiliasi UI): `POST /api/auth/register` dengan `BOOTSTRAP_TOKEN` dan `"role":"admin"` — lihat [10-AKSES-LOGIN.md](10-AKSES-LOGIN.md).

Reliability (idempotency, retry, admin rekonsiliasi): [13-RELIABILITY.md](13-RELIABILITY.md).  
Checklist sidang: [14-SIDANG-DEMO.md](14-SIDANG-DEMO.md).  
Smoke API (backend hidup): `./backend/scripts/smoke_api.sh`.  
E2E Playwright: [15-E2E.md](15-E2E.md).  
Manual book (panduan UI per role): [21-MANUAL-BOOK.md](21-MANUAL-BOOK.md).  
Verifikasi gabungan: `./scripts/check-all.sh` (opsional `RUN_E2E_PUBLIC=1` jika Playwright terpasang).

Cek koneksi:

```bash
psql "$DATABASE_URL" -c "SELECT 1;"
```

Setelah backend jalan: `curl -s http://localhost:8080/health/ready` harus `database: up`.

Uji integrasi blockchain (opsional, butuh Hardhat + `.env`):

```bash
cd backend && RUN_BLOCKCHAIN_INTEGRATION=1 go test ./internal/blockchain/... -count=1
```

## 2. Blockchain

Terminal A:

```bash
cd blockchain
npm install
npx hardhat node
```

Terminal B (deploy kontrak ke node yang berjalan):

```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network localhost
```

Salin alamat `DonationRegistry` ke `backend/.env` sebagai `BLOCKCHAIN_CONTRACT_ADDRESS`.

## 3. Backend

```bash
cp backend/.env.example backend/.env
# Sesuaikan DATABASE_URL, BOOTSTRAP_TOKEN, BLOCKCHAIN_CONTRACT_ADDRESS, dll.

cd backend
set -a && source .env && set +a
go run ./cmd/server
```

API: `http://127.0.0.1:8080/health`

## 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Buka `http://localhost:5173` (beranda). Login: `http://localhost:5173/login`.

UI **TrustGive** memakai desain konsisten (Poppins, palet navy/biru): navbar, kartu campaign, form, dan halaman login terpisah (tanpa layout navbar di `/login`).

### Dependensi Node di root (`npm install`)

Folder root memuat `snarkjs` / `circomlibjs` untuk generate proof. Peringatan `npm audit` (~19) pada toolchain ZK **normal** untuk demo lokal.

- Boleh: `npm audit` (baca saja)
- **Jangan:** `npm audit fix --force` — dapat menurunkan `circomlibjs` dan merusak generate proof
- Pin yang dipakai: `circomlibjs@^0.1.7`

Tes proof:

```bash
node zk/scripts/generate-donation-proof.js 100000 5000000 | head -c 80
```

## Akun dan login

Panduan role: **[10-AKSES-LOGIN.md](10-AKSES-LOGIN.md)**.

1. Set `BOOTSTRAP_TOKEN` di `backend/.env` (sama dengan `.env.example` atau nilai Anda sendiri).
2. Backend harus sudah jalan.
3. Buat akun (jalankan **masing-masing perintah curl secara terpisah**):

```bash
cd backend
set -a && source .env && set +a
export BOOTSTRAP_TOKEN="$BOOTSTRAP_TOKEN"

curl -s -X POST http://127.0.0.1:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Bootstrap-Token: $BOOTSTRAP_TOKEN" \
  -d '{"email":"pengelola@demo.local","password":"demo12345","role":"organizer"}'

curl -s -X POST http://127.0.0.1:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Bootstrap-Token: $BOOTSTRAP_TOKEN" \
  -d '{"email":"donatur@demo.local","password":"demo12345","role":"donor"}'
```

4. Login di **http://localhost:5173/login**
5. **Logout → login lagi** setelah mengubah role di database (JWT menyimpan role lama).

### Akun demo sidang

| Email | Role | Tugas di UI |
|---|---|---|
| `pengelola@demo.local` | `organizer` | Buat campaign |
| `donatur@demo.local` | `donor` | Kirim donasi |

Password contoh: `demo12345` (minimal 8 karakter untuk register API).

Opsional di `backend/.env` — batas login gagal per IP: `AUTH_LOGIN_MAX_ATTEMPTS=10`, `AUTH_LOGIN_WINDOW_MIN=15`. Lihat [08-KEAMANAN.md](08-KEAMANAN.md).

## Alur demo

1. Login sebagai **pengelola** → buat campaign (`max_donation` terdaftar on-chain).
2. Logout → login sebagai **donatur** → detail campaign → donasi (proof + chain + Paillier).
3. Lihat riwayat donasi dan ringkasan agregat.

## Troubleshooting

### `{"error":"email already exists"}`

Email sudah terdaftar. Login dengan akun itu, atau gunakan email lain. Cek:

```bash
cd backend && set -a && source .env && set +a
psql "$DATABASE_URL" -c "SELECT email, role FROM users ORDER BY email;"
```

### Pengelola tidak bisa buat campaign (JWT / UI masih donor)

Akun lama sering ber-role `donor`. Perbaiki lalu **login ulang**:

```bash
cd backend && set -a && source .env && set +a
psql "$DATABASE_URL" -c \
  "UPDATE users SET role = 'organizer' WHERE email = 'pengelola@demo.local';"
```

### `psql: database "zagoto" does not exist`

Variabel `DATABASE_URL` tidak ter-set di shell. Jalankan `source backend/.env` seperti di atas; jangan mengandalkan default `psql` tanpa URL.

### `role "zkdonation" does not exist`

Anda memakai URL Docker (`zkdonation`) tetapi Postgres lokal memakai user lain. Sesuaikan `DATABASE_URL` di `backend/.env` dengan DB yang benar-benar dipakai backend.

### `curl: Could not resolve host: ..`

Jangan menjalankan baris placeholder `curl ...` dari dokumentasi. Setiap register harus perintah `curl` lengkap.

### Donasi gagal / proof gagal

- Hardhat node harus jalan; kontrak ter-deploy; `BLOCKCHAIN_CONTRACT_ADDRESS` benar.
- Root: `circomlibjs` harus `^0.1.7` (bukan hasil `npm audit fix --force`).

### Dashboard donatur: `Request failed` / `GET /api/me/donations` 404

Backend masih proses lama sebelum rute `GET /api/me/donations` ada. **Stop** `go run ./cmd/server` lalu jalankan lagi dari folder `backend`. Log startup harus memuat baris `GET /api/me/donations`.

## Catatan penelitian

- Proof dibuat di server (demo); bukan privasi penuh terhadap backend.
- Restart `hardhat node` menghapus state chain; deploy ulang kontrak dan perbarui `.env`.

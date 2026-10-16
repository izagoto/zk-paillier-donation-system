# Menjalankan Sistem Lokal (Demo)

## Prasyarat

- Go 1.22+
- Node.js 20+
- PostgreSQL (atau `docker compose up -d postgres`)
- Circom/snarkjs artefak di `zk/build/` (sudah ada di mesin pengembangan)

## 1. Database

```bash
docker compose up -d postgres
```

Migrasi:

```bash
cd backend
migrate -path migrations -database "$DATABASE_URL" up
```

(`migrate` = [golang-migrate](https://github.com/golang-migrate/migrate) CLI)

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
# edit CONTRACT address setelah deploy

cd backend
go run ./cmd/server
```

API: `http://127.0.0.1:8080/health`

## 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Buka `http://localhost:5173`

## Akun dan login

Panduan lengkap siapa boleh akses apa: **[10-AKSES-LOGIN.md](10-AKSES-LOGIN.md)**.

Ringkas:

- **Tanpa login:** pengunjung bisa melihat campaign di web.
- **Dengan login:** hanya user yang sudah ada di database (email + password).
- **Tidak ada menu Daftar** di UI; akun dibuat via API oleh pengelola penelitian.

Setelah backend jalan, buat akun demo:

```bash
curl -s -X POST http://127.0.0.1:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"pengelola@demo.local","password":"demo12345"}'

curl -s -X POST http://127.0.0.1:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"donatur@demo.local","password":"demo12345"}'
```

Login di frontend: **http://localhost:5173/login** dengan salah satu akun di atas.

## Alur demo

1. Login dengan akun demo
2. Buat campaign (mendaftarkan `max_donation` ke smart contract)
3. Buka detail campaign → kirim donasi (generate proof + on-chain + aggregate Paillier)
4. Lihat riwayat donasi dan total terdekripsi di ringkasan agregat

## Catatan penelitian

- Proof dibuat di server (demo); bukan privasi penuh terhadap backend.
- Restart `hardhat node` menghapus state chain; deploy ulang kontrak dan perbarui `.env`.

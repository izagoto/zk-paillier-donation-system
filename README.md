# zk-paillier-donation-system (TrustGive)

**Prototipe sistem donasi transparan berbasis blockchain, Paillier Homomorphic Encryption, dan zk-SNARK.**

> **Status:** penelitian / demo lokal (backend + frontend MVP). **Bukan layanan keuangan produksi.** Backend masih melihat nominal donasi dalam plaintext; proof zk **belum** mengikat ciphertext Paillier.

**Repository:** https://github.com/izagoto/zk-paillier-donation-system

## Gambaran singkat

Pencatatan donasi yang dapat diverifikasi on-chain, enkripsi nominal dengan Paillier, agregasi homomorfik, dan validasi batas donasi dengan Groth16. Antarmuka web **TrustGive** (`frontend/`) mendukung alur demo lengkap tanpa API client manual.

## Akses dan login

| Pengguna | Perlu login? | Yang bisa dilakukan |
|---|---|---|
| **Pengunjung** | Tidak | Lihat beranda, daftar campaign, detail campaign |
| **Akun terdaftar** | Ya | Buat campaign, donasi (ZK + blockchain), lihat riwayat & agregat |

- **Tidak ada registrasi di website** — hanya halaman **Masuk**.
- Akun dibuat sekali oleh pengelola penelitian via API (`POST /api/auth/register`), misalnya:

```bash
curl -s -X POST http://127.0.0.1:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"pengelola@demo.local","password":"demo12345"}'
```

Lalu login di `http://localhost:5173/login` dengan email/password tersebut.

Penjelasan lengkap: **[docs/10-AKSES-LOGIN.md](docs/10-AKSES-LOGIN.md)**.

## Menjalankan demo (singkat)

1. PostgreSQL + migrasi (`docker compose up -d postgres`, `migrate ... up`)
2. `npx hardhat node` + deploy kontrak → isi `BLOCKCHAIN_CONTRACT_ADDRESS` di `backend/.env`
3. `cd backend && go run ./cmd/server`
4. Buat akun demo (curl di atas)
5. `cd frontend && npm run dev` → buka http://localhost:5173

Detail: **[docs/LOCAL-SETUP.md](docs/LOCAL-SETUP.md)**.

## Fitur yang sudah diuji

- Login JWT (tanpa UI registrasi).
- Frontend TrustGive: campaign, donasi, proof, status transaksi, ringkasan agregat.
- Campaign on-chain (`max_donation`), Paillier, Groth16, `DonationRegistry` (Hardhat).
- Idempotency key pada donasi (migration **000006**).
- Arsip duplikasi historis (migration **000005**).

**Penelitian lanjutan:** rekonsiliasi DB↔chain penuh, proof-to-ciphertext binding, deployment produksi.

## Teknologi

| Lapisan | Teknologi |
|---|---|
| Frontend | React, Vite, React Router (`frontend/`) |
| Backend | Go, Gin |
| Database | PostgreSQL, golang-migrate |
| Enkripsi | Paillier Homomorphic Encryption |
| Zero-knowledge | Circom, snarkjs, Groth16, Poseidon |
| Blockchain | Solidity, Hardhat, EVM JSON-RPC |
| Autentikasi | JWT |

## Alur donasi (happy path)

```mermaid
flowchart TD
    A[Pengguna login di TrustGive] --> B[Go Gin API]
    B --> C[Validasi campaign dan nominal]
    C --> D[Generate & verifikasi Groth16]
    D --> E[Enkripsi Paillier]
    E --> F[(PostgreSQL)]
    F --> G[DonationRegistry]
    G --> H[Confirmed + aggregate]
```

## Dokumentasi

| Dokumen | Isi |
|---|---|
| [PRD](docs/01-PRD.md) | Kebutuhan produk dan fitur |
| [Penelitian](docs/02-PENELITIAN.md) | Latar belakang, tujuan, batasan |
| [Goals](docs/03-GOALS.md) | Indikator keberhasilan |
| [Arsitektur](docs/04-ARSITEKTUR.md) | Komponen dan trust boundary |
| [Perancangan Sistem](docs/05-PERANCANGAN-SISTEM.md) | Modul, data, API |
| [Workflow](docs/05-WORKFLOW.md) | Alur proses |
| [Struktur Proyek](docs/06-STRUKTUR-PROYEK.md) | Direktori |
| [Teknologi](docs/07-TEKNOLOGI.md) | Stack |
| [Keamanan](docs/08-KEAMANAN.md) | Threat model |
| [Roadmap](docs/09-ROADMAP.md) | Tahapan pengembangan |
| [Setup lokal](docs/LOCAL-SETUP.md) | Menjalankan semua komponen |
| [**Akses & login**](docs/10-AKSES-LOGIN.md) | Siapa login, bootstrap akun |

## Keamanan

Jangan commit `.env`, private key blockchain, `JWT_SECRET`, atau kunci Paillier. Proof saat ini memverifikasi rentang nominal dan commitment Poseidon, **bukan** kesesuaian ciphertext Paillier — lihat [docs/08-KEAMANAN.md](docs/08-KEAMANAN.md).

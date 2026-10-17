# Checklist demo sidang (TrustGive)

Gunakan dokumen ini sebagai urutan singkat sebelum presentasi. Detail teknis: [11-LOCAL-SETUP.md](11-LOCAL-SETUP.md), [10-AKSES-LOGIN.md](10-AKSES-LOGIN.md), [13-RELIABILITY.md](13-RELIABILITY.md).

## Sebelum sidang (sekali)

- [ ] PostgreSQL + migrasi sampai `000007`
- [ ] `backend/.env` lengkap (JWT, DB, blockchain, Paillier path)
- [ ] Hardhat node + deploy kontrak; alamat kontrak di `.env`
- [ ] Akun demo: `pengelola@demo.local`, `donatur@demo.local` / `demo12345`
- [ ] Akun **admin** via `POST /api/auth/register` + `BOOTSTRAP_TOKEN`
- [ ] Opsional: `./backend/scripts/setup_demo_presentation.sh` (metadata campaign)
- [ ] Smoke API: `./backend/scripts/smoke_api.sh`

## Terminal yang harus hidup

| Layanan | Perintah |
|---------|----------|
| Chain | `cd blockchain && npx hardhat node` |
| Backend | `cd backend && go run ./cmd/server` |
| Frontend | `cd frontend && npm run dev` |

Log backend harus memuat worker rekonsiliasi pending (default tiap 120 detik). Matikan dengan `DONATION_PENDING_RECONCILE_SEC=0`.

## Alur demo (15–20 menit)

1. **Pengunjung** — buka home, lihat daftar campaign (filter aktif), buka detail + agregat tanpa login.
2. **Pengelola** — login `pengelola@demo.local`, buat atau tunjuk campaign, dashboard organizer.
3. **Donatur** — logout → login `donatur@demo.local`, halaman donasi penuh, submit donasi, lihat **Donasi saya** (status, verifikasi, retry jika gagal).
4. **Auditor** — login auditor (jika ada): hanya baca.
5. **Admin** — `/admin/reconciliation`: overview status, archive, **Proses pending**, reconcile agregat campaign.

## Poin yang ingin ditekankan

- Idempotency: submit ulang dengan key sama tidak menggandakan donasi (HTTP 200).
- Status `pending` / `failed` / `confirmed` + retry tanpa baris baru.
- Agregat Paillier + ZK (scope demo: proof di server — lihat Phase 4 roadmap).
- Archive duplikat historis hanya audit, bukan sumber kebenaran live.

## Jika sesuatu gagal

| Gejala | Tindakan |
|--------|----------|
| Backend tidak start | Hardhat jalan? RPC & contract address benar? |
| Donasi stuck `pending` | Admin **Proses pending** atau tunggu worker; cek log backend |
| 401 / menu salah | Logout, login ulang; cek role di DB |
| Chain reset | Deploy ulang kontrak, update `.env`, donasi lama mungkin tidak terverifikasi |

## Opsional (pengujian reliability)

- Uji manual idempotency: [13-RELIABILITY.md](13-RELIABILITY.md)
- Uji paralel (butuh file body donasi): `DONATION_JSON=... ./backend/scripts/concurrent_idempotency.sh`
- Unit test backend: `cd backend && go test ./internal/donation/...`

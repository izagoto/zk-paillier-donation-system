# Checklist demo sidang (TrustGive)

Gunakan dokumen ini sebagai urutan singkat sebelum presentasi. Detail teknis: [11-LOCAL-SETUP.md](11-LOCAL-SETUP.md), [10-AKSES-LOGIN.md](10-AKSES-LOGIN.md), [13-RELIABILITY.md](13-RELIABILITY.md). Keterbatasan untuk penguji: [16-KETERBATASAN-DEMO.md](16-KETERBATASAN-DEMO.md). Panduan halaman UI: [21-MANUAL-BOOK.md](21-MANUAL-BOOK.md).

## Sebelum sidang (sekali)

- [ ] PostgreSQL + migrasi sampai `000007`
- [ ] `backend/.env` lengkap (JWT, DB, blockchain, Paillier path)
- [ ] Hardhat node + deploy kontrak; alamat kontrak di `.env`
- [ ] Akun demo: `pengelola@demo.local`, `donatur@demo.local` / `demo12345`
- [ ] Akun **admin** via `POST /api/auth/register` + `BOOTSTRAP_TOKEN`
- [ ] Opsional: `./backend/scripts/setup_demo_presentation.sh` (metadata + data scroll tabel UI)
- [ ] Smoke API: `./backend/scripts/smoke_api.sh`

## Terminal yang harus hidup

| Layanan | Perintah |
|---------|----------|
| Chain | `cd blockchain && npx hardhat node` |
| Backend | `cd backend && go run ./cmd/server` |
| Frontend | `cd frontend && npm run dev` |

Log backend harus memuat worker rekonsiliasi pending (default tiap 120 detik). Matikan dengan `DONATION_PENDING_RECONCILE_SEC=0`.

## Skrip demo ~15 menit (urutan klik + narasi)

Buka **http://localhost:5173**. Siapkan dua tab mental: dulu sebagai pengunjung, lalu ganti peran dengan **Keluar** (menu avatar) sebelum login berikutnya.

| Menit | Peran | URL / aksi | Yang bisa Anda katakan ke penguji |
|-------|--------|------------|-----------------------------------|
| 0–2 | Pengunjung | `/` → **Jelajahi campaign** → filter tab **Aktif** → **Lihat detail** pada satu campaign | “Tanpa akun, publik bisa melihat campaign dan total terkumpul; nominal per donatur tidak dipublikasikan.” |
| 2–3 | Pengunjung | Di detail: tab **Tentang**, **Donasi masuk**, **Transparansi**; **Lihat bukti** (modal verifikasi); tunjuk agregat & badge *Donasi tercatat & dapat diaudit* | “Transparansi = jejak on-chain + agregat terenkripsi; privasi nominal dijelaskan di tab Transparansi.” |
| 3–5 | Pengelola | `/login` → `pengelola@demo.local` / `demo12345` → `/organizer` | “Pengelola punya dashboard: jumlah campaign, grafik donasi 7 hari, campaign terbaru.” |
| 5–7 | Pengelola | **Campaign saya** (`/campaigns?mine=1`) atau **Buat campaign**; buka detail campaign milik sendiri → **Kelola** (edit metadata/status) bila perlu | “Campaign terdaftar di DB dan batas maksimal donasi tercatat di smart contract.” |
| 7–8 | Pengelola | **Donasi masuk** — tabel status + hash transaksi (tanpa nominal donatur) | “Pengelola melihat bukti masuk, bukan jumlah per orang.” |
| 8–9 | — | Avatar → **Keluar** | Wajib logout agar menu tidak campur role. |
| 9–12 | Donatur | `/login` → `donatur@demo.local` / `demo12345` → **Jelajahi campaign** → detail → **Donasi** atau `/campaigns/:id/donate` | “Donatur mengisi nominal, konfirmasi, lalu backend membuat proof Groth16, enkripsi Paillier, dan transaksi ke Hardhat.” |
| 12–13 | Donatur | Stepper: nominal → **Lanjut ke konfirmasi** → kirim; tunggu status **Terkonfirmasi** (beberapa detik) | “Satu donasi = satu baris + idempotency key; pengiriman ulang tidak menggandakan.” |
| 13–14 | Donatur | **Riwayat donasi** → baris terbaru → **Verifikasi** (halaman publik) | “Donatur melihat nominal di riwayat pribadi; halaman verifikasi publik hanya commitment + tx hash.” |
| 14–15 | Admin (opsional) | Login admin → **Rekonsiliasi** → tunjuk kartu Pending/Archive → **Proses pending** / **Rekonsiliasi** agregat jika relevan | “Admin menyelesaikan ketidakpastian RPC dan menyelaraskan agregat tanpa menghapus archive historis.” |

Rute UI lengkap: [12-FRONTEND-FLOW.md](12-FRONTEND-FLOW.md).

### Alur demo (ringkas)

1. **Pengunjung** — home, daftar campaign (filter aktif), detail + agregat.
2. **Pengelola** — dashboard, campaign saya / buat, donasi masuk.
3. **Donatur** — donasi full-page, riwayat, verifikasi publik.
4. **Auditor** (jika ada akun) — transparansi + jelajahi campaign, tanpa donasi/buat campaign.
5. **Admin** — `/admin/reconciliation`: overview, archive, proses pending, reconcile agregat.

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

## Cek cepat sebelum naik podium

```bash
./backend/scripts/smoke_api.sh
cd frontend && PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:public   # butuh: npx playwright install chromium
```

## Opsional (pengujian reliability)

- Uji manual idempotency: [13-RELIABILITY.md](13-RELIABILITY.md)
- Uji paralel (butuh file body donasi): `DONATION_JSON=... ./backend/scripts/concurrent_idempotency.sh`
- Unit test backend: `cd backend && go test ./internal/donation/...`

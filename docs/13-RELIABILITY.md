# Reliability: idempotency, retry, rekonsiliasi

## Idempotency donasi

- Header wajib: `Idempotency-Key: <uuid>`
- Request ulang dengan key sama → **HTTP 200** + body donasi yang sudah ada (tidak membuat baris baru).
- Race concurrent insert → unique index `donations_idempotency_key_unique` + lookup ulang.

Uji manual:

```bash
KEY=$(uuidgen)
# ... login, dapat TOKEN ...
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8080/api/donations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: $KEY" \
  -H "Content-Type: application/json" \
  -d @donation.json
# Jalankan perintah yang sama lagi → harus 200
```

## Retry donasi gagal

- Hanya status `failed`, milik donatur (atau admin).
- `POST /api/donations/:id/retry` — memakai ciphertext & proof tersimpan, tanpa baris donasi baru.
- Transisi: `failed` → `pending` → `confirmed` atau `failed`.

## Admin rekonsiliasi

Peran `admin` (JWT):

| Endpoint | Fungsi |
|----------|--------|
| `GET /api/admin/reconciliation/overview` | Jumlah donasi per status + baris archive |
| `GET /api/admin/donations/archive?limit=50` | Cuplikan `donations_duplicate_archive` |
| `POST /api/admin/campaigns/:id/reconcile-aggregate` | Hitung ulang agregat Paillier dari donasi `confirmed` |

UI: `/admin/reconciliation` (login sebagai admin).

## Rekonsiliasi pending (RPC / chain)

- `POST /api/admin/donations/reconcile-pending?limit=50`
- Untuk setiap donasi `pending`: jika sudah ada `tx_hash`, konfirmasi + agregat; jika belum, kirim ulang ke chain (`finalizeOnChain`).
- UI: tombol **Proses pending** di `/admin/reconciliation`.
- **Worker otomatis:** saat server jalan, goroutine memanggil rekonsiliasi yang sama setiap `DONATION_PENDING_RECONCILE_SEC` detik (default `120`; `0` = mati). Lihat `backend/.env.example`.

## Smoke & uji paralel

```bash
./backend/scripts/smoke_api.sh
# Opsional admin:
ADMIN_EMAIL=admin@demo.local ADMIN_PASSWORD=... ./backend/scripts/smoke_api.sh
```

Uji concurrent idempotency (butuh body donasi valid):

```bash
export DONATION_JSON=/path/to/donation-body.json
./backend/scripts/concurrent_idempotency.sh
```

Unit test (termasuk deteksi unique violation): `go test ./internal/donation/...`

## Kebijakan archive (canonical record)

1. **Sumber kebenaran donasi live:** tabel `donations` + status `confirmed` + `tx_hash` yang masih valid di Hardhat saat ini.
2. **`donations_duplicate_archive`:** hanya audit historis; **tidak** di-merge otomatis ke live.
3. **Agregat campaign:** `POST .../reconcile-aggregate` menghitung ulang dari donasi `confirmed` — dipakai bila ciphertext aggregate tidak selaras.
4. Setelah reset Hardhat, tx lama tidak dianggap terverifikasi hanya dari hash di DB.

## Batasan

- Retry tidak memvalidasi ulang Groth16 (proof sudah tersimpan saat percobaan pertama).
- Rekonsiliasi aggregate tidak mengubah riwayat donasi; hanya menyelaraskan `campaign_aggregates`.
- Archive historis tidak otomatis digabung ke tabel live — kebijakan di atas.
- Proof-to-ciphertext binding belum diimplementasikan (lihat Phase 4 roadmap).

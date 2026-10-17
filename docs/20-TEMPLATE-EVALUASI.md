# Template evaluasi (laporan / sidang)

Isi dengan hasil pengukuran Anda; angka di bawah contoh format saja.

## Correctness

| Skenario | Hasil | Bukti |
|----------|-------|--------|
| Donasi valid → `confirmed` + tx hash | | Screenshot riwayat / verify |
| Proof invalid ditolak | | Log API / test zk |
| Agregat dekripsi = jumlah confirmed | | `cmd/verify-aggregate` |

## Reliability

| Skenario | Hasil | Bukti |
|----------|-------|--------|
| Replay idempotency key | | HTTP 200, satu baris |
| Retry `failed` | | [13-RELIABILITY.md](13-RELIABILITY.md) |
| Pending + reconcile | | Admin UI / worker log |

## Performance (opsional)

```bash
cd backend
go test -bench=. -benchmem ./internal/crypto/paillier/... -count=1
go test -bench=. -benchmem ./internal/zk/... -count=1
```

Catat: waktu generate proof (API), waktu submit donasi end-to-end, waktu verifikasi.

## Privacy (klaim)

Jelaskan apa yang **tidak** dibuktikan (plaintext ke server, tanpa binding) — [16-KETERBATASAN-DEMO.md](16-KETERBATASAN-DEMO.md), [17-PROOF-CIPHERTEXT-BINDING.md](17-PROOF-CIPHERTEXT-BINDING.md).

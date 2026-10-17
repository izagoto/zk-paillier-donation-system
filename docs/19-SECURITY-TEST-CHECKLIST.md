# Checklist pengujian keamanan & reliability

Mapping ke implementasi dan cara menjalankan.

| Uji | Otomatis | Cara |
|-----|----------|------|
| Transisi status donasi valid | Ya | `go test ./internal/donation/...` (`status_test.go`) |
| Idempotency key wajib | Ya | `service_create_test.go`, `handler_create_test.go` |
| Unique violation Postgres | Ya | `TestIsUniqueViolation` |
| Replay idempotency (HTTP 200) | Manual / skrip | [13-RELIABILITY.md](13-RELIABILITY.md), `concurrent_idempotency.sh` |
| Proof Groth16 valid/invalid | Ya (zk package) | `go test ./internal/zk/...` |
| Integrasi chain + proof | Opsional | `RUN_BLOCKCHAIN_INTEGRATION=1 go test ./internal/blockchain/...` |
| UI publik tanpa auth | Ya (CI) | `npm run test:e2e:public` |
| Login + API ready | Lokal | `E2E_DONOR_*`, `E2E_EXPECT_BACKEND=1` — [15-E2E.md](15-E2E.md) |
| Ciphertext ≠ witness | **Belum** | Butuh Phase 4 — [17-PROOF-CIPHERTEXT-BINDING.md](17-PROOF-CIPHERTEXT-BINDING.md) |
| Rate limiting API | **Belum** | Direncanakan untuk deployment non-demo |

Verifikasi cepat sebelum sidang:

```bash
./scripts/check-all.sh
```

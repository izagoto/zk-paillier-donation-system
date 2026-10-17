# Checklist pengujian keamanan & reliability

Mapping ke implementasi dan cara menjalankan.

| Uji | Otomatis | Cara |
|-----|----------|------|
| Transisi status donasi valid | Ya | `go test ./internal/donation/...` (`status_test.go`) |
| Idempotency key wajib | Ya | `service_create_test.go`, `handler_create_test.go` |
| Unique violation Postgres | Ya | `TestIsUniqueViolation` |
| Replay idempotency (HTTP 200) | Manual / skrip | [13-RELIABILITY.md](13-RELIABILITY.md), `concurrent_idempotency.sh` |
| Proof Groth16 valid/invalid | Ya (lokal, butuh `zk/build/`) | `go test ./internal/zk/...` — di CI di-skip jika artefak tidak ada |
| Integrasi chain + proof | Opsional | `RUN_BLOCKCHAIN_INTEGRATION=1 go test ./internal/blockchain/...` |
| UI publik tanpa auth | Ya (CI) | `npm run test:e2e:public` |
| Login + API ready | Lokal | `E2E_DONOR_*`, `E2E_EXPECT_BACKEND=1` — [15-E2E.md](15-E2E.md) |
| Password bcrypt + kebijakan register | Ya | `go test ./internal/auth/...` (`password_test.go`) |
| Login gagal generik (tidak bocor email) | Manual | UI: *Email atau kata sandi salah.* — [08-KEAMANAN.md](08-KEAMANAN.md) |
| Rate limit login gagal per IP | Ya (in-memory) | Default 10× / 15 menit → HTTP 429; `AUTH_LOGIN_*` di `.env` |
| Brute force login (uji manual) | Manual | Salah password berulang → pesan rate limit di UI; restart backend reset counter |
| Ciphertext ≠ witness | **Belum** | Butuh Phase 4 — [17-PROOF-CIPHERTEXT-BINDING.md](17-PROOF-CIPHERTEXT-BINDING.md) |
| Rate limiting API global / WAF | **Belum** | Produksi: reverse proxy / Redis — lihat [08-KEAMANAN.md](08-KEAMANAN.md) |

Verifikasi cepat sebelum sidang:

```bash
./scripts/check-all.sh
```

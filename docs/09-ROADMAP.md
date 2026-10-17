# Roadmap Pengembangan

## Phase 1 — Fondasi backend dan kriptografi

**Status:** pengujian awal selesai.  
Cakupan: auth, campaign, Paillier, circuit dan Groth16, smart contract, API donasi, aggregate, E2E happy path.

## Phase 2 — Integritas data dan reliability

**Status:** selesai untuk MVP sidang; perbaikan lanjutan bila data produksi bertumbuh.

- [x] Investigasi duplicate historis.
- [x] Backup database sebelum perbaikan.
- [x] Migration 000005 membuat tabel archive.
- [x] Verifikasi isi tabel archive dan rencana reconciliation (lihat [13-RELIABILITY.md](13-RELIABILITY.md)).
- [x] Tetapkan kebijakan canonical record (archive read-only; live = confirmed + tx valid).
- [x] Pertahankan audit trail dan rekonsiliasi aggregate bila diperlukan (admin UI + API).
- [x] Terapkan idempotency key pada database dan service (migration 000006).
- [x] Respons HTTP 200 pada replay idempotency key; tangani race unique constraint.
- [x] Transisi status donasi `pending` → `confirmed` / `failed` (tanpa lompatan sembarangan).
- [x] Retry donasi `failed` (`POST /api/donations/:id/retry`) tanpa baris baru.
- [x] Overview rekonsiliasi + hitung ulang agregat (admin API + UI).
- [x] Rekonsiliasi chain vs DB untuk `pending` (admin `POST /api/admin/donations/reconcile-pending`).
- [x] Worker otomatis / terjadwal untuk RPC timeout (`DONATION_PENDING_RECONCILE_SEC`, goroutine di server).
- [x] Uji concurrent idempotency: skrip `backend/scripts/concurrent_idempotency.sh` + unit test `IsUniqueViolation` (uji manual di [13-RELIABILITY.md](13-RELIABILITY.md)).

**Exit criteria:** retry tidak menggandakan donasi; status dan aggregate dapat direkonsiliasi; bukti historis tetap terpelihara.

## Phase 3 — Frontend MVP

**Status:** MVP selesai untuk demo lokal.

- [x] Login dan RBAC role (donor, organizer, auditor, admin).
- [x] Tanpa registrasi di UI; halaman login terpisah dari layout utama.
- [x] Daftar/detail campaign.
- [x] Form donasi (generate proof via API + submit).
- [x] Status transaksi dan riwayat donasi.
- [x] Ringkasan aggregate (termasuk dekripsi demo di backend).
- [x] UI TrustGive konsisten (tipografi, warna, komponen form/tombol).
- [x] Halaman donasi penuh, verifikasi publik donasi, dashboard auditor, metadata campaign.

**Exit criteria:** pengguna menyelesaikan happy path tanpa terminal/API client.

## Phase 4 — Penguatan protokol kriptografi

**Status:** penelitian lanjutan.

- [x] Definisikan threat model dan properti privasi (ringkas di [08-KEAMANAN.md](08-KEAMANAN.md) §5).
- [x] Desain proof-to-ciphertext binding ([17-PROOF-CIPHERTEXT-BINDING.md](17-PROOF-CIPHERTEXT-BINDING.md)); implementasi circuit belum.
- [ ] Evaluasi client-side encryption dan pengelolaan randomness.
- [ ] Benchmark proof generation/verification serta Paillier (perintah di [20-TEMPLATE-EVALUASI.md](20-TEMPLATE-EVALUASI.md)).
- [ ] Tinjau keamanan kunci dan trusted setup (ringkas di [18-BACKUP-RECOVERY-DEMO.md](18-BACKUP-RECOVERY-DEMO.md)).

**Exit criteria:** klaim kriptografi dibuktikan melalui desain, test, dan evaluasi yang dapat direproduksi.

## Phase 5 — Pengujian dan staging

**Status:** dimulai (CI lokal/GitHub Actions); staging penuh belum.

- [x] CI: `go test` (tanpa integrasi Hardhat default) + `frontend` build (`.github/workflows/ci.yml`).
- [x] E2E browser Playwright — tes publik di CI; login/API lokal (`@integration`, lihat [15-E2E.md](15-E2E.md)).
- [ ] E2E alur donasi penuh di CI (manual sidang + [14-SIDANG-DEMO.md](14-SIDANG-DEMO.md)).
- [x] Security/reliability tests terstruktur (checklist [19-SECURITY-TEST-CHECKLIST.md](19-SECURITY-TEST-CHECKLIST.md), `handler_create_test.go`).
- [x] Observability dasar: log request (`X-Request-Id`), `/health/ready` (ping DB).
- [x] Backup & recovery demo ([18-BACKUP-RECOVERY-DEMO.md](18-BACKUP-RECOVERY-DEMO.md)); staging terpisah belum.
- [x] Template evaluasi laporan ([20-TEMPLATE-EVALUASI.md](20-TEMPLATE-EVALUASI.md)); isi angka oleh peneliti.
- [x] Dokumentasi keterbatasan demo ([16-KETERBATASAN-DEMO.md](16-KETERBATASAN-DEMO.md)); laporan eksperimen formal masih terbuka.

## Next step langsung

Untuk sidang: [14-SIDANG-DEMO.md](14-SIDANG-DEMO.md), `./backend/scripts/setup_demo_presentation.sh`, `./backend/scripts/smoke_api.sh`, akun `admin` via register API. Penelitian lanjutan: proof-to-ciphertext binding (Phase 4), E2E CI (Phase 5).

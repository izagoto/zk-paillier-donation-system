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

- [ ] Definisikan threat model dan properti privasi.
- [ ] Desain proof-to-ciphertext binding.
- [ ] Evaluasi client-side encryption dan pengelolaan randomness.
- [ ] Benchmark proof generation/verification serta Paillier.
- [ ] Tinjau keamanan kunci dan trusted setup.

**Exit criteria:** klaim kriptografi dibuktikan melalui desain, test, dan evaluasi yang dapat direproduksi.

## Phase 5 — Pengujian dan staging

**Status:** direncanakan.

- [ ] Integration/E2E/security tests.
- [ ] Observability, backup, recovery, staging.
- [ ] Evaluasi correctness, privacy, performance, reliability.
- [ ] Dokumentasi hasil eksperimen dan keterbatasan.

## Next step langsung

Untuk sidang: [14-SIDANG-DEMO.md](14-SIDANG-DEMO.md), `./backend/scripts/setup_demo_presentation.sh`, `./backend/scripts/smoke_api.sh`, akun `admin` via register API. Penelitian lanjutan: proof-to-ciphertext binding (Phase 4), E2E CI (Phase 5).

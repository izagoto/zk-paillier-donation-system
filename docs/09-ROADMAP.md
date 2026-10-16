# Roadmap Pengembangan

## Phase 1 — Fondasi backend dan kriptografi

**Status:** pengujian awal selesai.  
Cakupan: auth, campaign, Paillier, circuit dan Groth16, smart contract, API donasi, aggregate, E2E happy path.

## Phase 2 — Integritas data dan reliability

**Status:** sedang dikerjakan; prioritas tertinggi.

- [x] Investigasi duplicate historis.
- [x] Backup database sebelum perbaikan.
- [x] Migration 000005 membuat tabel archive.
- [ ] Verifikasi isi tabel archive dan rencana reconciliation.
- [ ] Tetapkan canonical record dengan bukti yang memadai.
- [ ] Pertahankan audit trail dan rekonsiliasi aggregate bila diperlukan.
- [x] Terapkan idempotency key pada database dan service (migration 000006).
- [ ] Terapkan state machine yang aman.
- [ ] Implementasikan retry dan recovery transaksi blockchain.
- [ ] Uji duplicate, concurrency, kegagalan DB/RPC, dan aggregate.

**Exit criteria:** retry tidak menggandakan donasi; status dan aggregate dapat direkonsiliasi; bukti historis tetap terpelihara.

## Phase 3 — Frontend MVP

**Status:** MVP selesai untuk demo lokal.

- [x] Login dan registrasi.
- [x] Daftar/detail campaign.
- [x] Form donasi (generate proof via API + submit).
- [x] Status transaksi dan riwayat donasi.
- [x] Ringkasan aggregate (termasuk dekripsi demo di backend).

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

Verifikasi tabel `donations_duplicate_archive` pada database version 5, lalu susun rencana reconciliation yang tidak mengubah confirmed history berdasarkan asumsi. Setelah itu kerjakan idempotency dan transaksi yang dapat dipulihkan.

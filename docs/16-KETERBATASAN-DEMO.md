# Keterbatasan demo (TrustGive)

Ringkasan untuk sidang dan penulisan laporan. Detail keamanan: [08-KEAMANAN.md](08-KEAMANAN.md).

## Lingkungan

- **Hardhat lokal** — reset node menghapus state chain; `tx_hash` lama di PostgreSQL tidak otomatis valid.
- **Bukan produksi** — tidak ada payment gateway, KYC, atau jaminan privasi end-to-end.

## Kriptografi & privasi

- Nominal donasi dikirim **plaintext** ke backend (demo); proof Groth16 **belum** mengikat ciphertext Paillier.
- Dekripsi agregat untuk tampilan UI memakai private key di server (demo Paillier).
- Proof dihasilkan di server, bukan di browser donatur.

## Keandalan

- Idempotency, retry, worker pending, dan admin rekonsiliasi **diuji untuk demo lokal**; belum SLA produksi 24/7.
- Uji concurrent idempotency penuh: skrip manual + unit test, bukan beban CI default.

## Pengujian otomatis

- CI: unit backend (tanpa integrasi Hardhat default), build frontend, Playwright halaman **publik**.
- E2E donasi + ZK + chain: **manual** atau skrip lokal ([15-E2E.md](15-E2E.md), [14-SIDANG-DEMO.md](14-SIDANG-DEMO.md)).

## Yang disengaja di luar scope MVP

- Proof-to-ciphertext binding, client-side encryption, staging terpisah, laporan benchmark formal (Phase 4–5 roadmap).

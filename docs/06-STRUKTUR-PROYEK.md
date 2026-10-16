# Struktur Proyek dan Tanggung Jawab Direktori

Struktur di bawah adalah **pemetaan komponen yang diketahui dan struktur dokumentasi yang disarankan**, bukan hasil inspeksi menyeluruh seluruh repository.

```text
zk-paillier-donation-system/
├── README.md
├── frontend/
│   └── ...          # TrustGive (React/Vite)
├── docs/
│   ├── PRD.md
│   ├── PENELITIAN.md
│   ├── GOALS.md
│   ├── ARSITEKTUR.md
│   ├── PERANCANGAN-SISTEM.md
│   ├── WORKFLOW.md
│   ├── STRUKTUR-PROYEK.md
│   ├── TEKNOLOGI.md
│   ├── KEAMANAN.md
│   ├── 10-AKSES-LOGIN.md
│   └── LOCAL-SETUP.md
├── backend/
│   ├── cmd/
│   │   ├── server/main.go
│   │   ├── verify-aggregate/main.go
│   │   └── verify-donations/main.go
│   ├── internal/
│   │   ├── donation/
│   │   │   ├── handler.go
│   │   │   ├── service.go
│   │   │   └── repository.go
│   │   └── ...
│   ├── migrations/
│   │   ├── 000001_create_users.*.sql
│   │   ├── 000002_create_campaigns.*.sql
│   │   ├── 000003_create_donations.*.sql
│   │   ├── 000004_create_campaign_aggregates.*.sql
│   │   └── 000005_add_donation_duplicate_archive.*.sql
│   └── ...
├── blockchain/
│   └── ...
└── zk/
    ├── build/
    └── ...
```

## Tanggung jawab

- `backend/cmd/server`: entrypoint API.
- `backend/internal/donation`: handler HTTP, aturan bisnis, dan query database donasi.
- `backend/cmd/verify-aggregate`: alat pengujian dekripsi aggregate.
- `backend/cmd/verify-donations`: alat pemeriksaan donation records.
- `backend/migrations`: perubahan skema database berurutan.
- `blockchain`: kontrak Solidity, deployment, dan pengujian EVM.
- `zk`: circuit, input, proof, verification key, dan artefak pengujian.
- `docs`: spesifikasi produk, penelitian, arsitektur, alur, dan roadmap.

**Penting:** file `.env`, private key, dan artefak rahasia tidak boleh dikomit. Nama direktori selain yang sudah diketahui harus diverifikasi menggunakan `find`/`tree` pada repository sebelum dijadikan dokumentasi final.

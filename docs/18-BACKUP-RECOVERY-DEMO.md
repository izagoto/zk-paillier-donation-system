# Backup & recovery (lingkungan demo)

Panduan operasional lokal — **bukan** runbook produksi.

## Backup PostgreSQL

```bash
cd backend && set -a && source .env && set +a
pg_dump "$DATABASE_URL" -Fc -f "backup-$(date +%Y%m%d-%H%M).dump"
```

Restore ke database kosong:

```bash
pg_restore -d "$DATABASE_URL" --clean --if-exists backup-YYYYMMDD-HHMM.dump
```

Sebelum migrasi besar atau cleanup duplikat, selalu backup (lihat kebijakan di [13-RELIABILITY.md](13-RELIABILITY.md)).

## Setelah reset Hardhat

1. Deploy ulang kontrak (`cd blockchain && npx hardhat run scripts/deploy.ts --network localhost`).
2. Update `BLOCKCHAIN_CONTRACT_ADDRESS` di `backend/.env`.
3. Restart backend.
4. Donasi lama: status di DB mungkin masih `confirmed` tetapi tx tidak ada di chain baru — gunakan admin **Rekonsiliasi** / kebijakan di [16-KETERBATASAN-DEMO.md](16-KETERBATASAN-DEMO.md).

## Kunci yang harus di-backup terpisah

- `backend/.env` (tanpa commit ke git)
- File kunci Paillier (`PAILLIER_KEY_PATH`)
- Artefak ZK verifying key di `zk/build/`

## Staging

Environment staging terpisah **belum** disediakan; untuk sidang cukup tiga terminal di [11-LOCAL-SETUP.md](11-LOCAL-SETUP.md).

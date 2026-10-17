#!/usr/bin/env bash
# Siapkan DB demo untuk sidang (butuh DATABASE_URL atau postgres default).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DB_URL="${DATABASE_URL:-postgres://postgres:postgres@localhost:5432/trustgive?sslmode=disable}"

echo "==> Tutup campaign uji (cleanup)"
psql "$DB_URL" -f "$ROOT/backend/scripts/cleanup_demo_campaigns.sql"

echo "==> Perkaya metadata campaign pengelola (seed)"
psql "$DB_URL" -f "$ROOT/backend/scripts/seed_demo_presentation.sql"

echo "==> Data scroll DataTable (>=6 baris per tabel demo)"
psql "$DB_URL" -f "$ROOT/backend/scripts/seed_datatable_scroll.sql"

echo "Selesai. Pastikan Hardhat + backend + frontend berjalan."
echo "Uji scroll UI: docs/15-E2E.md (bagian DataTable demo)."

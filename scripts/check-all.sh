#!/usr/bin/env bash
# Verifikasi lokal (mirip CI + opsional smoke API).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "== backend tests =="
(
  cd "$ROOT/backend"
  go test $(go list ./... | grep -v '/internal/blockchain$')
)

echo "== frontend build =="
(
  cd "$ROOT/frontend"
  npm run build
)

if [[ "${SKIP_SMOKE:-}" == "1" ]]; then
  echo "== smoke API skipped (SKIP_SMOKE=1) =="
else
  if curl -sf "http://127.0.0.1:8080/health" >/dev/null 2>&1; then
    echo "== smoke API =="
    "$ROOT/backend/scripts/smoke_api.sh"
  else
    echo "== smoke API skipped (backend tidak di :8080) =="
  fi
fi

if [[ "${RUN_E2E_PUBLIC:-}" == "1" ]]; then
  echo "== playwright @public =="
  (
    cd "$ROOT/frontend"
    PLAYWRIGHT_SKIP_WEBSERVER=1 npm run test:e2e:public
  )
fi

echo "check-all: OK"

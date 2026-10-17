#!/usr/bin/env bash
# Smoke test cepat: backend hidup, login demo, daftar campaign.
set -euo pipefail

API_BASE="${API_BASE:-http://localhost:8080}"
DONOR_EMAIL="${DONOR_EMAIL:-donatur@demo.local}"
DONOR_PASSWORD="${DONOR_PASSWORD:-demo12345}"

if ! command -v jq >/dev/null 2>&1; then
	echo "jq diperlukan (brew install jq)" >&2
	exit 1
fi

echo "→ GET /health"
curl -sf "$API_BASE/health" | jq -e '.status == "ok"' >/dev/null

echo "→ GET /health/ready"
curl -sf "$API_BASE/health/ready" | jq -e '.status == "ok" and .database == "up"' >/dev/null

echo "→ POST /api/auth/login ($DONOR_EMAIL)"
TOKEN="$(
	curl -sf -X POST "$API_BASE/api/auth/login" \
		-H "Content-Type: application/json" \
		-d "{\"email\":\"$DONOR_EMAIL\",\"password\":\"$DONOR_PASSWORD\"}" \
		| jq -r '.access_token // .token // empty'
)"
if [[ -z "$TOKEN" ]]; then
	echo "login gagal — pastikan akun demo ada (lihat docs/10-AKSES-LOGIN.md)" >&2
	exit 1
fi

echo "→ GET /api/campaigns"
curl -sf -H "Authorization: Bearer $TOKEN" "$API_BASE/api/campaigns" \
	| jq -e '.data | type == "array"' >/dev/null

echo "→ GET /api/me/donations"
curl -sf -H "Authorization: Bearer $TOKEN" "$API_BASE/api/me/donations" \
	| jq -e '.data | type == "array"' >/dev/null

if [[ -n "${ADMIN_EMAIL:-}" && -n "${ADMIN_PASSWORD:-}" ]]; then
	echo "→ GET /api/admin/reconciliation/overview (admin)"
	ADMIN_TOKEN="$(
		curl -sf -X POST "$API_BASE/api/auth/login" \
			-H "Content-Type: application/json" \
			-d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
			| jq -r '.access_token // .token // empty'
	)"
	if [[ -n "$ADMIN_TOKEN" ]]; then
		curl -sf -H "Authorization: Bearer $ADMIN_TOKEN" \
			"$API_BASE/api/admin/reconciliation/overview" \
			| jq -e '.live_donations != null' >/dev/null
	fi
fi

echo "smoke_api: OK"

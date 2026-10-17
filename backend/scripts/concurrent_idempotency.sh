#!/usr/bin/env bash
# Uji paralel: beberapa POST donasi dengan Idempotency-Key sama → semua HTTP 200, satu baris live.
# Butuh: backend + Hardhat + file body JSON (hasil generate-proof + ciphertext dari UI atau API).
#
# Contoh:
#   export API_BASE=http://localhost:8080
#   export DONATION_JSON=/tmp/donation-body.json
#   ./backend/scripts/concurrent_idempotency.sh
set -euo pipefail

API_BASE="${API_BASE:-http://localhost:8080}"
DONOR_EMAIL="${DONOR_EMAIL:-donatur@demo.local}"
DONOR_PASSWORD="${DONOR_PASSWORD:-demo12345}"
PARALLEL="${PARALLEL:-5}"
DONATION_JSON="${DONATION_JSON:-}"

if [[ -z "$DONATION_JSON" || ! -f "$DONATION_JSON" ]]; then
	echo "Set DONATION_JSON ke file body POST /api/donations (lihat docs/13-RELIABILITY.md)." >&2
	exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
	echo "jq diperlukan" >&2
	exit 1
fi

TOKEN="$(
	curl -sf -X POST "$API_BASE/api/auth/login" \
		-H "Content-Type: application/json" \
		-d "{\"email\":\"$DONOR_EMAIL\",\"password\":\"$DONOR_PASSWORD\"}" \
		| jq -r '.access_token // .token // empty'
)"
if [[ -z "$TOKEN" ]]; then
	echo "login gagal" >&2
	exit 1
fi

KEY="$(uuidgen)"
TMPDIR="${TMPDIR:-/tmp}"
RESULTS="$TMPDIR/idempotency-parallel-$$"
mkdir -p "$RESULTS"

post_once() {
	local idx="$1"
	local code
	code="$(
		curl -s -o "$RESULTS/body-$idx.json" -w "%{http_code}" \
			-X POST "$API_BASE/api/donations" \
			-H "Authorization: Bearer $TOKEN" \
			-H "Idempotency-Key: $KEY" \
			-H "Content-Type: application/json" \
			-d @"$DONATION_JSON"
	)"
	echo "$code" >"$RESULTS/code-$idx.txt"
}

echo "Idempotency-Key: $KEY ($PARALLEL request paralel)"
for i in $(seq 1 "$PARALLEL"); do
	post_once "$i" &
done
wait

bad=0
for i in $(seq 1 "$PARALLEL"); do
	code="$(cat "$RESULTS/code-$i.txt")"
	if [[ "$code" != "200" && "$code" != "201" ]]; then
		echo "request $i → HTTP $code (harap 200)" >&2
		bad=1
	fi
done

ID_FIRST="$(jq -r '.id // .donation.id // empty' "$RESULTS/body-1.json" 2>/dev/null || true)"
for i in $(seq 2 "$PARALLEL"); do
	ID_I="$(jq -r '.id // .donation.id // empty' "$RESULTS/body-$i.json" 2>/dev/null || true)"
	if [[ -n "$ID_FIRST" && -n "$ID_I" && "$ID_FIRST" != "$ID_I" ]]; then
		echo "ID donasi tidak sama antara request 1 dan $i" >&2
		bad=1
	fi
done

rm -rf "$RESULTS"

if [[ "$bad" -ne 0 ]]; then
	exit 1
fi

echo "concurrent_idempotency: OK (semua sukses, ID konsisten)"

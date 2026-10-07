#!/usr/bin/env bash
# Smoke-test the Intelli Partner webhook receiver.
#
# Usage:
#   bash app/api/webhooks/webhook-test.sh
#
# Prerequisites:
#   - The dev server or production server is running on http://localhost:3000
#   - A webhook subscription exists with a known secret (e.g. from the DB seed or
//     the Webhooks API). By default this script signs with the first registered
//     WebhookConfig secret fetched from the API. If none exists, set WEBHOOK_ID
//     and WEBHOOK_SECRET manually below.
#
# The script:
#   1. Fetches the list of enabled webhook configs from POST /api/webhooks?action=list
#   2. Picks the first one (or uses env overrides)
#   3. Sends a signed POST to /api/webhooks/events
#   4. Prints the response

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
WEBHOOK_SECRET="${INTELLI_WEBHOOK_SECRET:-}"

# --- use the env secret (single shared secret, not DB lookup) ---
if [ -z "$WEBHOOK_SECRET" ]; then
  echo "ERROR: INTELLI_WEBHOOK_SECRET is not set in .env or environment."
  echo "  Add it to .env:"
  echo "    INTELLI_WEBHOOK_SECRET=<your-secret>"
  echo "  Then re-run the test."
  exit 1
fi

# --- 2) build the signed payload ---
PAYLOAD='{"event":"webhook.test","channel":"whatsapp","payload":{"ping":true}}'

# Compute HMAC-SHA256(secret) over the raw JSON string
SIGNATURE=$(printf '%s' "$PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" -hex 2>/dev/null | awk '{print $NF}')
SIGNATURE_HEADER="sha256=${SIGNATURE}"

# --- 3) send the request ---
echo ""
echo "> POST ${BASE_URL}/api/webhooks/events"
echo "  X-Intelli-Signature: ${SIGNATURE_HEADER}"
echo "  X-Intelli-Event: webhook.test"
echo "  X-Intelli-Channel: whatsapp"
echo "  X-Intelli-Sender-Client-Ref: smoke-test-client"
echo "  X-Intelli-Sender-Account-Id: smoke-test-account"
echo "  raw body: ${PAYLOAD}"
echo "  secret (from env): ${WEBHOOK_SECRET:0:8}..."
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/webhooks/events" \
  -H "Content-Type: application/json" \
  -H "X-Intelli-Signature: ${SIGNATURE_HEADER}" \
  -H "X-Intelli-Event: webhook.test" \
  -H "X-Intelli-Channel: whatsapp" \
  -H "X-Intelli-Sender-Client-Ref: smoke-test-client" \
  -H "X-Intelli-Sender-Account-Id: smoke-test-account" \
  -d "${PAYLOAD}")

HTTP_CODE="${RESPONSE##*$'\n'}"
BODY="${RESPONSE%$'\n'}"

echo "< HTTP ${HTTP_CODE}"
echo "< body: ${BODY}"
echo ""

if [ "$HTTP_CODE" = "202" ]; then
  echo "OK — receiver accepted the signed delivery (202 Delivered)."
else
  echo "FAIL — expected 202, got ${HTTP_CODE}."
  exit 1
fi


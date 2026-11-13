#!/usr/bin/env bash
# Railway CLI with ICE WIND's project-scoped production token.
# The token stays outside this Git repository and never changes the global CLI login.
set -euo pipefail

TOKEN_FILE="${ICEWIND_RAILWAY_TOKEN_FILE:-/Users/maksimilin/Desktop/ICEWIND/.secrets/railway-icewind-production.token}"
if [ ! -f "$TOKEN_FILE" ]; then
  echo "ICE WIND Railway token is missing: $TOKEN_FILE" >&2
  exit 1
fi
if [ "$(stat -f '%Lp' "$TOKEN_FILE")" != "600" ]; then
  echo "ICE WIND Railway token must have file mode 600: $TOKEN_FILE" >&2
  exit 1
fi
IFS= read -r RAILWAY_TOKEN < "$TOKEN_FILE"
if [ -z "$RAILWAY_TOKEN" ]; then
  echo "ICE WIND Railway token is empty: $TOKEN_FILE" >&2
  exit 1
fi
export RAILWAY_TOKEN
unset RAILWAY_API_TOKEN
exec railway "$@"

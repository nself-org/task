#!/usr/bin/env bash
# ɳTasks backend smoke test suite.
#
# Verifies the Docker Compose stack comes up, services are healthy, the
# GraphQL API answers, and CRUD over a scratch table works end-to-end.
#
# Usage:
#   ./test/smoke.sh            # full cycle: up, wait, test, teardown
#   SMOKE_KEEP_UP=1 ./test/smoke.sh  # leave stack running on success
#
# Exit codes:
#   0  all checks passed
#   1  a check failed

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$BACKEND_DIR"

HASURA_URL="${HASURA_URL:-http://localhost:8080}"
AUTH_URL="${AUTH_URL:-http://localhost:4000}"
STORAGE_URL="${STORAGE_URL:-http://localhost:8484}"
HASURA_ADMIN_SECRET="${HASURA_ADMIN_SECRET:-nself-admin-secret}"
WAIT_TIMEOUT="${WAIT_TIMEOUT:-90}"

pass=0
fail=0
tests=()

log()   { printf '\033[0;34m[smoke]\033[0m %s\n' "$*"; }
ok()    { printf '\033[0;32m  PASS\033[0m %s\n' "$*"; pass=$((pass+1)); tests+=("PASS $*"); }
bad()   { printf '\033[0;31m  FAIL\033[0m %s\n' "$*"; fail=$((fail+1)); tests+=("FAIL $*"); }

cleanup() {
  if [ "${SMOKE_KEEP_UP:-0}" = "1" ] && [ "$fail" -eq 0 ]; then
    log "SMOKE_KEEP_UP=1 set; leaving stack running"
    return
  fi
  log "tearing down stack"
  docker compose --profile dev down --remove-orphans >/dev/null 2>&1 || true
}
trap cleanup EXIT

# ---------------------------------------------------------------------------
# 1. Start stack
# ---------------------------------------------------------------------------
log "starting Docker Compose stack"
if ! docker compose --profile dev up -d >/tmp/smoke-up.log 2>&1; then
  bad "docker compose up (see /tmp/smoke-up.log)"
  exit 1
fi
ok "docker compose up"

# ---------------------------------------------------------------------------
# 2. Wait for services
# ---------------------------------------------------------------------------
wait_for() {
  local name="$1" url="$2" deadline=$((SECONDS + WAIT_TIMEOUT))
  while [ $SECONDS -lt $deadline ]; do
    if curl -sf -o /dev/null "$url"; then
      ok "$name healthy ($url)"
      return 0
    fi
    sleep 2
  done
  bad "$name did not come up within ${WAIT_TIMEOUT}s ($url)"
  return 1
}

wait_for "Hasura"  "$HASURA_URL/healthz"  || true
wait_for "Auth"    "$AUTH_URL/healthz"    || true
wait_for "Storage" "$STORAGE_URL/healthz" || true

# ---------------------------------------------------------------------------
# 3. GraphQL version query (admin)
# ---------------------------------------------------------------------------
log "querying Hasura version"
ver_resp=$(curl -sf \
  -H "x-hasura-admin-secret: $HASURA_ADMIN_SECRET" \
  "$HASURA_URL/v1/version" || echo '')
if printf '%s' "$ver_resp" | grep -q '"version"'; then
  ok "Hasura version endpoint ($ver_resp)"
else
  bad "Hasura version endpoint returned: $ver_resp"
fi

# ---------------------------------------------------------------------------
# 4. GraphQL introspection
# ---------------------------------------------------------------------------
log "GraphQL introspection"
introspect=$(curl -sf \
  -H "x-hasura-admin-secret: $HASURA_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{__schema{queryType{name}}}"}' \
  "$HASURA_URL/v1/graphql" || echo '')
if printf '%s' "$introspect" | grep -q '"queryType"'; then
  ok "GraphQL introspection responded"
else
  bad "GraphQL introspection failed: $introspect"
fi

# ---------------------------------------------------------------------------
# 5. CRUD via SQL (scratch table)
# ---------------------------------------------------------------------------
log "CRUD smoke via SQL endpoint"
sql() {
  curl -sf \
    -H "x-hasura-admin-secret: $HASURA_ADMIN_SECRET" \
    -H "Content-Type: application/json" \
    -d "{\"type\":\"run_sql\",\"args\":{\"sql\":\"$1\",\"read_only\":false}}" \
    "$HASURA_URL/v2/query"
}

if sql "CREATE TABLE IF NOT EXISTS smoke_test (id serial PRIMARY KEY, note text);" >/dev/null; then
  ok "CREATE table smoke_test"
else
  bad "CREATE table smoke_test"
fi

if sql "INSERT INTO smoke_test (note) VALUES ('hello');" >/dev/null; then
  ok "INSERT into smoke_test"
else
  bad "INSERT into smoke_test"
fi

sel=$(sql "SELECT note FROM smoke_test WHERE note='hello' LIMIT 1;" || echo '')
if printf '%s' "$sel" | grep -q 'hello'; then
  ok "SELECT from smoke_test"
else
  bad "SELECT from smoke_test: $sel"
fi

if sql "DELETE FROM smoke_test WHERE note='hello';" >/dev/null; then
  ok "DELETE from smoke_test"
else
  bad "DELETE from smoke_test"
fi

sql "DROP TABLE IF EXISTS smoke_test;" >/dev/null || true

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo
log "summary: $pass passed, $fail failed"
for line in "${tests[@]}"; do
  printf '  %s\n' "$line"
done

if [ "$fail" -ne 0 ]; then
  exit 1
fi
exit 0

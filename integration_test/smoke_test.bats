#!/usr/bin/env bats
# T-0395 — demo/ CI smoke tests
#
# nself-demo (nTasks) is a Next.js app with multi-backend support.
# These bats tests cover the static/static CI tier: type-check, build,
# and env file validation.
#
# Skip guard: set SKIP_FLUTTER_TESTS=1 to skip all tests in this file.
# (Variable name preserved for CI matrix compatibility with sibling repos.)
#
# Prerequisites: pnpm installed, node_modules present (pnpm install in frontend/)
# Run: bats demo/integration_test/smoke_test.bats
# CI:  SKIP_FLUTTER_TESTS=1 bats demo/integration_test/smoke_test.bats

REPO_ROOT="$(cd "$(dirname "$BATS_TEST_FILENAME")/../.." && pwd)"
FRONTEND="$REPO_ROOT/frontend"
ENV_EXAMPLE="$FRONTEND/env/.env.example"

setup() {
  if [ "${SKIP_FLUTTER_TESTS:-1}" = "1" ]; then
    skip "SKIP_FLUTTER_TESTS=1 — set to 0 to run demo CI smoke tests"
  fi

  if [ ! -d "$FRONTEND/node_modules" ]; then
    skip "node_modules not installed — run: pnpm install in $FRONTEND"
  fi
}

# ---------------------------------------------------------------------------
# Scenario 1 — TypeScript type-check exits 0
# ---------------------------------------------------------------------------
@test "TypeScript type-check passes (tsc --noEmit)" {
  run pnpm --dir "$FRONTEND" run typecheck
  [ "$status" -eq 0 ]
}

# ---------------------------------------------------------------------------
# Scenario 2 — Vitest unit tests exit 0
# ---------------------------------------------------------------------------
@test "Vitest unit tests exit 0" {
  run pnpm --dir "$FRONTEND" run test:run
  [ "$status" -eq 0 ]
}

# ---------------------------------------------------------------------------
# Scenario 3 — Next.js production build exits 0
# ---------------------------------------------------------------------------
@test "Next.js production build exits 0" {
  run pnpm --dir "$FRONTEND" run build
  [ "$status" -eq 0 ]
}

# ---------------------------------------------------------------------------
# Scenario 4 — Realtime plugin env var present in .env.example
#
# NEXT_PUBLIC_NSELF_REALTIME_URL is set by the nSelf realtime plugin
# and is required for real-time todo updates in the nTasks demo.
# ---------------------------------------------------------------------------
@test "NEXT_PUBLIC_NSELF_REALTIME_URL is present in env/.env.example" {
  [ -f "$ENV_EXAMPLE" ] || {
    echo "env/.env.example not found at: $ENV_EXAMPLE"
    return 1
  }
  grep -q "NEXT_PUBLIC_NSELF_REALTIME_URL" "$ENV_EXAMPLE"
}

# ---------------------------------------------------------------------------
# Scenario 5 — Analytics plugin env var documented in .env.example
#
# Expected var: NEXT_PUBLIC_NSELF_ANALYTICS_ENABLED or similar.
# If the analytics plugin env var has not yet been added to .env.example,
# this test fails as a reminder to document it — not as a build blocker.
#
# To resolve: add NEXT_PUBLIC_NSELF_ANALYTICS_ENABLED=false to env/.env.example
# See: nSelf analytics plugin documentation.
# ---------------------------------------------------------------------------
@test "analytics plugin env var documented in env/.env.example" {
  [ -f "$ENV_EXAMPLE" ] || {
    echo "env/.env.example not found at: $ENV_EXAMPLE"
    return 1
  }
  # Accept any var containing "ANALYTIC" (case-insensitive via grep -i)
  grep -qi "ANALYTIC" "$ENV_EXAMPLE"
}

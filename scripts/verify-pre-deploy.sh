#!/usr/bin/env bash
# scripts/verify-pre-deploy.sh — the one pre-deploy gate.
#
# Fail-closed: any failing step aborts immediately (set -e). Makes NO AWS
# calls — `cdk synth` only renders CloudFormation templates locally, so this
# script is safe to run repeatedly and safe to run without AWS credentials.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

LOG_DIR="$(mktemp -d)"
trap 'rm -rf "$LOG_DIR"' EXIT

banner() {
  echo ""
  echo "==> $1"
}

banner "Portfolio pre-deploy verification (repo root: $ROOT_DIR)"

if [ ! -d node_modules ]; then
  banner "Installing dependencies (npm install)"
  npm install
fi

banner "Lint (web)"
npm run lint

banner "Typecheck (web + infra)"
npm run typecheck

banner "Unit tests (web + infra)"
npm run test:unit 2>&1 | tee "$LOG_DIR/unit.log"

banner "Build (web static export -> web/out)"
npm run build

banner "E2E prerequisites: Playwright Chromium (installs only if missing)"
npx --prefix web playwright install chromium

banner "E2E tests (web)"
npm run test:e2e 2>&1 | tee "$LOG_DIR/e2e.log"

banner "CDK synth — PortfolioSite app (default app, bin/portfolio-site.ts)"
(cd infra && npx cdk synth >/dev/null)
echo "PortfolioSite: synth OK"

banner "CDK synth — PortfolioDns app (bin/dns.ts)"
(cd infra && npx cdk synth --app "npx tsx bin/dns.ts" >/dev/null)
echo "PortfolioDns: synth OK"

# ---- parse counts for the summary (best-effort; never fails the gate) ----
nth_vitest_count() {
  # $1 = log file, $2 = 1-based occurrence of a "  Tests  N passed" summary line
  grep -oE '^ *Tests +[0-9]+ passed' "$1" 2>/dev/null | grep -oE '[0-9]+' | sed -n "${2}p"
}

last_playwright_count() {
  grep -oE '[0-9]+ passed' "$1" 2>/dev/null | tail -1 | grep -oE '[0-9]+'
}

WEB_UNIT_COUNT="$(nth_vitest_count "$LOG_DIR/unit.log" 1 || true)"
INFRA_UNIT_COUNT="$(nth_vitest_count "$LOG_DIR/unit.log" 2 || true)"
E2E_COUNT="$(last_playwright_count "$LOG_DIR/e2e.log" || true)"

echo ""
echo "==================================================="
echo "PASS — pre-deploy verification complete"
echo "  lint (web)              : OK"
echo "  typecheck (web + infra)  : OK"
echo "  web unit tests           : ${WEB_UNIT_COUNT:-unknown} passed"
echo "  infra unit tests         : ${INFRA_UNIT_COUNT:-unknown} passed"
echo "  build (web/out)          : OK"
echo "  e2e tests (web)          : ${E2E_COUNT:-unknown} passed"
echo "  cdk synth PortfolioSite  : OK"
echo "  cdk synth PortfolioDns   : OK"
echo "==================================================="

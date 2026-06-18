#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_PYTHON="$ROOT_DIR/apps/api/.venv/bin/python"

echo "== CyberMap local validation =="
echo

if [ ! -x "$API_PYTHON" ]; then
  echo "ERROR: backend virtualenv python not found at: $API_PYTHON" >&2
  echo "Create it with:" >&2
  echo "  cd apps/api && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt" >&2
  exit 1
fi

echo "== Backend tests =="
"$API_PYTHON" -m pytest "$ROOT_DIR/apps/api"
echo

echo "== Frontend lint =="
npm --prefix "$ROOT_DIR/apps/web" run lint
echo

echo "== Frontend tests =="
npm --prefix "$ROOT_DIR/apps/web" run test
echo

echo "== Frontend build =="
npm --prefix "$ROOT_DIR/apps/web" run build
echo

echo "== Validation completed successfully =="

#!/usr/bin/env bash
set -euo pipefail

echo "== CyberMap Setup =="

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "== Backend setup =="
cd "$ROOT_DIR/apps/api"

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

source .venv/bin/activate
pip install -r requirements.txt
deactivate

cd "$ROOT_DIR"

echo "== Frontend setup =="
npm --prefix apps/web install

echo "== Environment setup =="
cp -n apps/api/.env.example apps/api/.env || true
cp -n apps/web/.env.example apps/web/.env.local || true

echo "== Validate install =="
./scripts/validate-local.sh

echo "== Setup completed =="

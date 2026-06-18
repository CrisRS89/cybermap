#!/usr/bin/env bash
set -euo pipefail

SOURCE_REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_DIR="${TMPDIR:-/tmp}/cybermap-fresh-clone-test"

echo "== CyberMap fresh clone validation =="
echo "Source: $SOURCE_REPO"
echo "Target: $TARGET_DIR"
echo

rm -rf "$TARGET_DIR"

echo "== Clone repository =="
git clone "$SOURCE_REPO" "$TARGET_DIR"
cd "$TARGET_DIR"
echo

echo "== Backend setup =="
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
deactivate
cd ../../
echo

echo "== Frontend setup =="
npm --prefix apps/web install
echo

echo "== Environment files =="
if [ -f apps/api/.env.example ]; then
  cp apps/api/.env.example apps/api/.env
fi

if [ -f apps/web/.env.example ]; then
  cp apps/web/.env.example apps/web/.env.local
fi
echo

echo "== Validate fresh clone =="
./scripts/validate-local.sh
echo

echo "== Fresh clone git status =="
git status --short
echo

echo "== Fresh clone validation completed successfully =="

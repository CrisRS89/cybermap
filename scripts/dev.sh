#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

API_PID=""
WEB_PID=""

cleanup() {
  echo
  echo "== Stopping CyberMap dev environment =="

  if [ -n "$API_PID" ] && kill -0 "$API_PID" 2>/dev/null; then
    kill "$API_PID"
  fi

  if [ -n "$WEB_PID" ] && kill -0 "$WEB_PID" 2>/dev/null; then
    kill "$WEB_PID"
  fi
}

trap cleanup EXIT INT TERM

echo "== Starting CyberMap dev environment =="

if [ ! -x "$ROOT_DIR/apps/api/.venv/bin/python" ]; then
  echo "ERROR: backend virtualenv not found."
  echo "Run first:"
  echo "  ./scripts/setup.sh"
  exit 1
fi

cd "$ROOT_DIR/apps/api"
source .venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000 &
API_PID=$!

cd "$ROOT_DIR"
npm --prefix apps/web run dev &
WEB_PID=$!

echo
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo
echo "Press Ctrl+C to stop both services."
echo

wait

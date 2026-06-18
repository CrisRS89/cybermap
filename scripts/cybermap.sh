#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CMD="${1:-help}"

case "$CMD" in
  install)
    bash "$ROOT_DIR/scripts/check-prereqs.sh"
    bash "$ROOT_DIR/scripts/setup.sh"
    ;;
  setup)
    bash "$ROOT_DIR/scripts/setup.sh"
    ;;
  dev)
    bash "$ROOT_DIR/scripts/dev.sh"
    ;;
  validate)
    bash "$ROOT_DIR/scripts/validate-local.sh"
    ;;
  test)
    "$ROOT_DIR/apps/api/.venv/bin/python" -m pytest "$ROOT_DIR/apps/api"
    npm --prefix "$ROOT_DIR/apps/web" run test
    ;;
  help|--help|-h)
    echo "CyberMap CLI"
    echo
    echo "Usage:"
    echo "  cybermap install    Check prerequisites, install dependencies, create env files, validate"
    echo "  cybermap setup      Install dependencies, create env files, validate"
    echo "  cybermap dev        Start backend and frontend"
    echo "  cybermap test       Run backend and frontend tests"
    echo "  cybermap validate   Run full local validation"
    ;;
  *)
    echo "ERROR: unknown command: $CMD"
    echo
    echo "Run:"
    echo "  cybermap help"
    exit 1
    ;;
esac

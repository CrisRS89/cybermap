#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

CMD="${1:-help}"

setup() {
  bash "$ROOT_DIR/scripts/setup.sh"
}

dev() {
  bash "$ROOT_DIR/scripts/dev.sh"
}

test() {
  "$ROOT_DIR/apps/api/.venv/bin/python" -m pytest "$ROOT_DIR/apps/api"
  npm --prefix "$ROOT_DIR/apps/web" run test
}

validate() {
  bash "$ROOT_DIR/scripts/validate-local.sh"
}

case "$CMD" in
  setup)
    setup
    ;;
  dev)
    dev
    ;;
  test)
    test
    ;;
  validate)
    validate
    ;;
  *)
    echo "Usage:"
    echo "  ./scripts/cybermap.sh setup"
    echo "  ./scripts/cybermap.sh dev"
    echo "  ./scripts/cybermap.sh test"
    echo "  ./scripts/cybermap.sh validate"
    ;;
esac

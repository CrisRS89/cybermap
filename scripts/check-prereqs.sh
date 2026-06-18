#!/usr/bin/env bash
set -euo pipefail

echo "== CyberMap prerequisites check =="

if ! command -v git >/dev/null 2>&1; then
  echo "ERROR: git is required but was not found."
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js is required but was not found."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm is required but was not found."
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: python3 is required but was not found."
  exit 1
fi

echo "git:    $(git --version)"
echo "node:   $(node --version)"
echo "npm:    $(npm --version)"
echo "python: $(python3 --version)"

echo "== Prerequisites OK =="

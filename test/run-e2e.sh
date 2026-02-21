#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

set -a
. "$ROOT_DIR/.env.e2e"
set +a

pnpm exec dbmate --migrations-dir ./db/migrations up
pnpm exec jest --config ./test/jest-e2e.json --runInBand "$@"

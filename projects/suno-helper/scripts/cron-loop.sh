#!/usr/bin/env bash
# Run one batch of the autonomous loop. Safe to call from cron: it takes a lock,
# writes a bounded ledger, and exits non-zero only on a real failure.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$HERE"

TURNS=25
QUIET=""
EXTRA=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --turns) TURNS="$2"; shift 2 ;;
    --quiet) QUIET="--quiet"; shift ;;
    *) EXTRA+=("$1"); shift ;;
  esac
done

# The CLI resolves the repo root itself, so state always lands in
# <repo>/.suno-helper even when this script is started from the project dir.
REPO="$(cd "$HERE/../.." && pwd)"
export PYTHONPATH="$HERE/agent${PYTHONPATH:+:$PYTHONPATH}"
mkdir -p "$REPO/.suno-helper"

python3 -m suno_helper loop \
  --turns "$TURNS" \
  --report-every 25 \
  ${QUIET} \
  "${EXTRA[@]}"

python3 -m suno_helper status --json > "$REPO/.suno-helper/last-status.json"

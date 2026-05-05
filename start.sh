#!/usr/bin/env bash
# Start Nidaan backend (FastAPI) and frontend (Next.js dev server) in parallel.
# Usage: ./start.sh
# Press Ctrl-C to stop both.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT/backend"
FRONTEND_DIR="$ROOT/frontend"

# Sanity checks
if [ ! -d "$BACKEND_DIR/.venv" ]; then
  echo "ERROR: $BACKEND_DIR/.venv not found. Run: cd backend && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt"
  exit 1
fi

if [ ! -f "$BACKEND_DIR/.env" ]; then
  echo "WARN: $BACKEND_DIR/.env not found. ANTHROPIC_API_KEY must be set for the pipeline to work."
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "Installing frontend deps…"
  (cd "$FRONTEND_DIR" && npm install)
fi

echo "──────────────────────────────────────────────────"
echo " Nidaan — starting backend + frontend"
echo "──────────────────────────────────────────────────"
echo " Backend:  http://localhost:8000"
echo " Frontend: http://localhost:3000"
echo " Press Ctrl-C to stop both."
echo "──────────────────────────────────────────────────"

# Trap to kill children on exit
pids=()
cleanup() {
  echo ""
  echo "Stopping services…"
  for pid in "${pids[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Backend
(
  cd "$BACKEND_DIR"
  source .venv/bin/activate
  exec python main.py
) &
pids+=($!)

# Give the backend a moment to bind
sleep 2

# Frontend
(
  cd "$FRONTEND_DIR"
  exec npm run dev
) &
pids+=($!)

wait

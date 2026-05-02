#!/usr/bin/env bash
# VanthAI — One-command demo startup script
# Usage: ./start.sh
# Starts: Docker stack (backend + postgres + redis) + Vite frontend dev server

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$REPO_ROOT/VanthAI_frontend"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║              VanthAI — Starting Up                   ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── 1. Check .env exists ──────────────────────────────────────────────────────
if [ ! -f "$REPO_ROOT/.env" ]; then
  echo "❌ .env not found at repo root."
  echo "   Copy .env and set your GOOGLE_AI_API_KEY before starting."
  exit 1
fi

echo "✅ .env found"

# ── 2. Check Docker is running ────────────────────────────────────────────────
if ! docker info >/dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker Desktop first."
  exit 1
fi

echo "✅ Docker running"

# ── 3. Start backend stack ────────────────────────────────────────────────────
echo ""
echo "▶  Starting backend containers (postgres + redis + fastapi)..."
docker compose -f "$REPO_ROOT/docker-compose.yml" up -d --build

# Wait for backend health
echo "⏳ Waiting for backend health check..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:8000/health >/dev/null 2>&1; then
    echo "✅ Backend is up at http://localhost:8000"
    break
  fi
  sleep 2
  if [ "$i" -eq 30 ]; then
    echo "❌ Backend health check timed out. Check: docker compose logs backend"
    exit 1
  fi
done

# ── 4. Start Vite dev server ──────────────────────────────────────────────────
echo ""
echo "▶  Starting Vite frontend at http://localhost:5173..."
cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
  echo "📦 Running npm install first..."
  npm install --legacy-peer-deps
fi

# Start in background, output to terminal
npm run dev &
VITE_PID=$!

sleep 3
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  VanthAI is running!                                 ║"
echo "║                                                      ║"
echo "║  Frontend:  http://localhost:5173                    ║"
echo "║  Backend:   http://localhost:8000                    ║"
echo "║  API Docs:  http://localhost:8000/docs               ║"
echo "║                                                      ║"
echo "║  Press Ctrl+C to stop the frontend dev server.       ║"
echo "║  Run: docker compose down  to stop backend.          ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Keep script alive until Ctrl+C
wait $VITE_PID

#!/bin/bash
cd "$(dirname "$0")"

echo "=========================================="
echo "  AI Feedback Generator"
echo "=========================================="
echo ""

echo "[1/2] Starting backend server (port 3001)..."
npx tsx src/server/index.ts &
BACKEND_PID=$!

echo "Waiting for backend to be ready..."
until curl -s http://localhost:3001/api/personas > /dev/null 2>&1; do
  sleep 2
  echo "  Still loading..."
done
echo "  Backend is ready!"

echo ""
echo "[2/2] Starting frontend dev server (Vite)..."
npx vite &
FRONTEND_PID=$!

sleep 3
echo ""
echo "=========================================="
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3001"
echo "=========================================="
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait

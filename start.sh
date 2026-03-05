#!/bin/bash

# Exit on error
set -e

echo "Setting up Python Virtual Environment..."
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi

echo "Installing Backend Dependencies..."
.venv/bin/pip install -r requirements.txt

echo "Starting Python API Backend in the background..."
.venv/bin/python server.py &
API_PID=$!

echo "Installing Frontend Dependencies..."
cd frontend
npm install

echo "Starting React Frontend on local network..."
npm run dev -- --host &
FRONTEND_PID=$!

echo ""
echo "=========================================="
echo "Backend running on http://0.0.0.0:8000"
echo "Frontend starting up on local network (exposed)..."
echo "Check terminal output for local IP address."
echo "Press Ctrl+C to stop both servers."
echo "=========================================="

# Trap ctrl-c and call cleanup
trap cleanup INT

function cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $API_PID
    kill $FRONTEND_PID
    exit 0
}

# Wait for background processes to exit
wait $API_PID
wait $FRONTEND_PID

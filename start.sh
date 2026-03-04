#!/bin/bash

# Exit on error
set -e

echo "Installing Backend Dependencies..."
pip3 install -r requirements.txt || pip install -r requirements.txt

echo "Starting Python API Backend in the background..."
python3 server.py &
API_PID=$!

echo "Installing Frontend Dependencies..."
cd frontend
npm install

echo "Starting React Frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=========================================="
echo "Backend running on http://localhost:8000"
echo "Frontend starting up..."
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

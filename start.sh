#!/bin/bash

# Book Summarizer - Startup Script

echo "================================"
echo "Book Summarizer - Starting..."
echo "================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

echo "✓ Python and Node.js found"
echo ""

# Install Python dependencies if needed
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
    echo "✓ Python dependencies installed"
else
    source venv/bin/activate
    echo "✓ Using existing Python virtual environment"
fi
echo ""

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo "✓ Frontend dependencies installed"
else
    echo "✓ Frontend dependencies already installed"
fi
echo ""

echo "================================"
echo "Starting servers..."
echo "================================"
echo ""
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Admin credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "================================"
echo ""

# Start backend in background
uvicorn api:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start frontend
cd frontend
npm run dev &
FRONTEND_PID=$!

# Wait for Ctrl+C
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

wait

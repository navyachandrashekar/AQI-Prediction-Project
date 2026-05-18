#!/bin/bash
# Quick start script for AQI Predictor

echo "🌿 AQI Predictor — Setup & Run"
echo "================================"

# 1. Install backend deps
echo ""
echo "📦 Installing Python dependencies..."
pip install -r backend/requirements.txt

# 2. Train models
echo ""
echo "🤖 Training ML models (this takes ~2-3 minutes)..."
python ml/train.py

# 3. Start backend in background
echo ""
echo "🚀 Starting FastAPI backend on http://localhost:8000 ..."
cd backend && uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

sleep 2

# 4. Start frontend
echo ""
echo "🎨 Starting React frontend on http://localhost:3000 ..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ All services running!"
echo "   Frontend : http://localhost:3000"
echo "   Backend  : http://localhost:8000"
echo "   API Docs : http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services."

wait $BACKEND_PID $FRONTEND_PID

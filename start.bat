@echo off
echo ===================================================
echo     Health Prediction System - Quick Start
echo ===================================================

echo 1. Starting backend server...
start cmd /k "cd backend && npm start"

echo 2. Waiting for backend to initialize (5 seconds)
timeout /t 5 /nobreak > nul

echo 3. Starting frontend...
start cmd /k "cd frontend && npm start"

echo.
echo System is starting up!
echo Backend: http://localhost:9090 (port may vary)
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit this window...
pause > nul

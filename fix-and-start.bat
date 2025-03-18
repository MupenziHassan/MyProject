@echo off
echo ===================================================
echo     Fixing and Starting Health Prediction System
echo ===================================================
echo.

echo [1/5] Installing backend dependencies...
cd backend
call npm install express mongoose dotenv cors
cd ..

echo [2/5] Installing frontend dependencies and polyfills...
cd frontend
call npm install react-app-rewired
call node install-deps.js
cd ..

echo [3/5] Starting Backend Server...
start cmd /k "cd backend && npm start"

echo [4/5] Waiting for backend to initialize (8 seconds)...
timeout /t 8 /nobreak > nul

echo [5/5] Starting Frontend Application...
start cmd /k "cd frontend && npm start"

echo.
echo ===================================================
echo    Health Prediction System is now running!
echo ===================================================
echo.
echo    Backend: http://localhost:9090
echo    Frontend: http://localhost:3000
echo.
echo    Press any key to exit this window.
echo    (The application will continue running)
echo ===================================================

pause > nul

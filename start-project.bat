@echo off
echo ===================================================
echo    Setting up Health Prediction System Project
echo ===================================================
echo.

echo [1/6] Installing backend dependencies...
cd backend
call npm install express mongoose dotenv cors
if %errorlevel% neq 0 (
  echo ERROR: Failed to install backend dependencies
  pause
  exit /b %errorlevel%
)
cd ..

echo [2/6] Starting Backend Server...
start cmd /k "cd backend && npm start"

echo [3/6] Waiting for backend to initialize (10 seconds)...
timeout /t 10 /nobreak > nul

echo [4/6] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
  echo ERROR: Failed to install frontend dependencies
  pause
  exit /b %errorlevel%
)
cd ..

echo [5/6] Starting Frontend Application...
start cmd /k "cd frontend && npm start"

echo [6/6] Opening browser in 5 seconds...
timeout /t 5 /nobreak > nul

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

@echo off
echo ===================================================
echo    Health Prediction System - Presentation Mode
echo ===================================================
echo.

echo Starting backend server...
start cmd /k "cd backend && node server.js"

echo Waiting 3 seconds for backend startup...
timeout /t 3 /nobreak > nul

echo Starting frontend...
start cmd /k "cd frontend && npm start"

echo.
echo ===================================================
echo System is starting! Please use these credentials:
echo.
echo Doctor: doctor@example.com / doctor123
echo Patient: patient@example.com / patient123
echo Admin: admin@example.com / admin123
echo ===================================================
echo.

@echo off
echo ===================================================
echo      Installing All Required Dependencies
echo ===================================================

echo Installing backend dependencies...
cd backend
call npm install express mongoose dotenv cors morgan
cd ..

echo.
echo Installing frontend dependencies...
cd frontend
call npm install react-app-rewired path-browserify stream-browserify assert util constants-browserify react-datepicker
cd ..

echo.
echo ===================================================
echo      All dependencies installed successfully!
echo ===================================================
echo To start the application, run:
echo 1. backend: npm start
echo 2. frontend: cd frontend && npm start
echo ===================================================

pause

@echo off
title Nexus ERP Startup
echo ===================================================
echo             Starting Nexus ERP System
echo ===================================================
echo.

echo [1/2] Starting Backend Server...
start "Nexus ERP Backend" cmd /k "cd backend && mvn spring-boot:run"

echo.
echo [2/2] Starting Frontend Application...
start "Nexus ERP Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo Both servers are starting up.
echo Please wait a few moments for them to initialize...
echo.
echo The application will open in your default browser automatically.
echo (If it doesn't open automatically, go to http://localhost:3000)

:: Wait for a few seconds before opening the browser to ensure the frontend server has started
timeout /t 10 /nobreak > nul

start http://localhost:3000

echo.
echo Startup script complete. You can minimize this window.
echo (Do not close the backend and frontend terminal windows until you want to stop the software)
pause

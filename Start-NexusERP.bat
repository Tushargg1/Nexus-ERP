@echo off
title Nexus ERP
REM ============================================================
REM  Nexus ERP - Launcher
REM ============================================================
REM  Starts the local Nexus ERP server and opens it in your
REM  browser. Keep this window open while using the software.
REM  Closing this window stops the software.
REM ============================================================

set PORT=8080
set URL=http://localhost:%PORT%

echo.
echo  ======================================
echo    Starting Nexus ERP ...
echo  ======================================
echo.

REM --- Check Java is installed ---
where java >nul 2>nul
if errorlevel 1 (
    echo  ERROR: Java is not installed or not found.
    echo  Please install Java 17 or newer, then run this again.
    echo.
    pause
    exit /b 1
)

REM --- Free the port if something is already using it ---
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%PORT% ^| findstr LISTENING') do (
    echo  Port %PORT% is in use. Stopping old instance (PID %%a)...
    taskkill /PID %%a /F >nul 2>nul
)

REM --- Start the application ---
echo  Launching server on %URL%
echo  (Keep this window open while using Nexus ERP.)
echo.

REM Open the browser after a short delay (gives the server time to boot)
start "" cmd /c "timeout /t 8 /nobreak >nul && start %URL%"

REM Run the app (this blocks and keeps the window open)
java -jar "%~dp0nexus-erp.jar"

echo.
echo  Nexus ERP has stopped.
pause

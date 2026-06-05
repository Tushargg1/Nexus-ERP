@echo off
REM ============================================================
REM  Nexus ERP - Package the app-image into the client download
REM ============================================================
REM  Zips dist-app\NexusERP into the installer zip and copies it
REM  into the backend resources so the website's gated
REM  /api/v1/software/download endpoint serves the real file.
REM
REM  Prerequisite: run build-app-image.bat first.
REM ============================================================

setlocal
set APP_DIR=dist-app\NexusERP
set ZIP_NAME=nexus-erp-pro-v2.4.1.zip
set INSTALLER_RES=backend\src\main\resources\installer

if not exist "%APP_DIR%" (
    echo  ERROR: %APP_DIR% not found. Run build-app-image.bat first.
    exit /b 1
)

echo.
echo [1/2] Adding the launcher readme to the app folder...
> "%APP_DIR%\README.txt" echo Nexus ERP - How to start:
>> "%APP_DIR%\README.txt" echo 1. Double-click NexusERP.exe
>> "%APP_DIR%\README.txt" echo 2. Your browser opens automatically at http://localhost:8080
>> "%APP_DIR%\README.txt" echo 3. Sign in with your registered email and password.
>> "%APP_DIR%\README.txt" echo Note: Internet is required only for the first sign-in and after signing out.

echo.
echo [2/2] Zipping the app-image as the client download...
if not exist "%INSTALLER_RES%" mkdir "%INSTALLER_RES%"
REM Zip the NexusERP folder itself (not its contents) so it extracts into ONE
REM clean parent folder. The app hides its own internal folders on first run,
REM so the client only sees NexusERP.exe after launching once.
powershell -NoProfile -Command "Compress-Archive -Path '%APP_DIR%' -DestinationPath '%INSTALLER_RES%\%ZIP_NAME%' -Force"

if errorlevel 1 (
    echo  Zip FAILED.
    exit /b 1
)

echo.
echo ============================================================
echo  DOWNLOAD PACKAGE READY
echo  Bundled at: %INSTALLER_RES%\%ZIP_NAME%
echo.
echo  IMPORTANT: rebuild the WEBSITE JAR after this so the zip
echo  is bundled into the served app:
echo    cd frontend ^&^& npm run build
echo    cd backend  ^&^& mvn clean package -DskipTests
echo  (or set app.installer.path to point at the zip directly)
echo ============================================================
endlocal

@echo off
REM ============================================================
REM  Nexus ERP - Build the installable software package
REM ============================================================
REM  This builds the frontend (installed mode) into the Spring
REM  Boot static folder, then packages everything into a single
REM  runnable JAR. The output JAR + launcher form the download.
REM ============================================================

echo.
echo [1/3] Building frontend (installed mode)...
cd frontend
call npm install
call npm run build:installed
if errorlevel 1 (
    echo Frontend build FAILED.
    exit /b 1
)
cd ..

echo.
echo [2/3] Building backend JAR (bundles the frontend)...
cd backend
call mvn clean package -DskipTests
if errorlevel 1 (
    echo Backend build FAILED.
    exit /b 1
)
cd ..

echo.
echo [3/3] Collecting release files...
if not exist "release" mkdir release
copy /Y backend\target\*.jar release\nexus-erp.jar
copy /Y Start-NexusERP.bat release\Start-NexusERP.bat

echo.
echo Packaging installer zip for the download endpoint...
powershell -NoProfile -Command "Compress-Archive -Path 'release\nexus-erp.jar','release\Start-NexusERP.bat' -DestinationPath 'release\nexus-erp-pro-v2.4.1.zip' -Force"
if not exist "backend\src\main\resources\installer" mkdir backend\src\main\resources\installer
copy /Y release\nexus-erp-pro-v2.4.1.zip backend\src\main\resources\installer\nexus-erp-pro-v2.4.1.zip

echo.
echo ============================================================
echo  BUILD COMPLETE
echo  Release files are in the 'release' folder:
echo    - nexus-erp.jar                 (the application)
echo    - Start-NexusERP.bat            (the launcher)
echo    - nexus-erp-pro-v2.4.1.zip      (the client download)
echo.
echo  NOTE: The installer zip was copied into the backend
echo  resources so the website's gated download serves it.
echo  Rebuild the website JAR after this to bundle it.
echo ============================================================

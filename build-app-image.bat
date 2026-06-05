@echo off
REM ============================================================
REM  Nexus ERP - Build a self-contained app (bundled JRE)
REM  using jpackage (--type app-image). No Java needed on the
REM  client machine; no WiX/installer toolchain required.
REM ============================================================
REM  Prerequisite: run build-jar first (frontend installed build
REM  + mvn package) so backend\target\garment-erp-1.0.0.jar exists.
REM ============================================================

setlocal
set APP_NAME=NexusERP
set APP_VERSION=2.4.1
set MAIN_JAR=garment-erp-1.0.0.jar
set JAR_DIR=backend\target
set OUT_DIR=dist-app

echo.
echo [1/3] Verifying the application JAR exists...
if not exist "%JAR_DIR%\%MAIN_JAR%" (
    echo  ERROR: %JAR_DIR%\%MAIN_JAR% not found.
    echo  Build it first:  cd backend ^&^& mvn clean package -DskipTests
    exit /b 1
)

echo.
echo [2/3] Cleaning previous output...
if exist "%OUT_DIR%" rmdir /S /Q "%OUT_DIR%"
mkdir "%OUT_DIR%"

echo.
echo [3/3] Running jpackage (this bundles a trimmed JRE)...
jpackage ^
  --type app-image ^
  --name %APP_NAME% ^
  --app-version %APP_VERSION% ^
  --input "%JAR_DIR%" ^
  --main-jar %MAIN_JAR% ^
  --main-class org.springframework.boot.loader.launch.JarLauncher ^
  --dest "%OUT_DIR%" ^
  --java-options "-Dserver.port=8080" ^
  --java-options "-Dapp.open-browser=true" ^
  --win-console ^
  --vendor "Nexus ERP" ^
  --description "Nexus ERP - Business Management System"

if errorlevel 1 (
    echo.
    echo  jpackage FAILED. See output above.
    exit /b 1
)

echo.
echo ============================================================
echo  APP-IMAGE BUILD COMPLETE
echo  Output folder: %OUT_DIR%\%APP_NAME%
echo    - %APP_NAME%.exe        (launches the bundled app)
echo    - runtime\              (bundled Java - client needs NO Java)
echo.
echo  Next: copy Launch-NexusERP.bat into the %APP_NAME% folder,
echo  then zip the whole %APP_NAME% folder as the client download.
echo  Run package-download.bat to do this automatically.
echo ============================================================
endlocal

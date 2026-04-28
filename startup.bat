@echo off
setlocal ENABLEDELAYEDEXPANSION

cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is not installed or not in PATH.
  echo Install Node.js LTS, then run this file again.
  pause
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo npm is not available. Reinstall Node.js LTS.
  pause
  exit /b 1
)

if not exist "server\node_modules" (
  echo Installing server dependencies...
  pushd "server"
  call npm install
  if errorlevel 1 (
    echo Server dependency install failed.
    popd
    pause
    exit /b 1
  )
  popd
)

if not exist "client\node_modules" (
  echo Installing client dependencies...
  pushd "client"
  call npm install
  if errorlevel 1 (
    echo Client dependency install failed.
    popd
    pause
    exit /b 1
  )
  popd
)

if not exist "client\dist" (
  echo Building client for production...
  pushd "client"
  call npm run build
  if errorlevel 1 (
    echo Client build failed.
    popd
    pause
    exit /b 1
  )
  popd
)

set "APP_PORT="
for /f "usebackq delims=" %%P in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "$ports=5000..5010; foreach($p in $ports){ if(-not (Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue)){ $p; break } }"`) do set "APP_PORT=%%P"
if "%APP_PORT%"=="" set "APP_PORT=5011"

echo.
echo === NETWORK CONFIGURATION ===
set "PC_IP=localhost"
for /f "usebackq delims=" %%i in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.AddressState -eq 'Preferred' -and $_.IPAddress -notlike '127*' -and $_.InterfaceAlias -notlike '*Loopback*' }).IPAddress | Select-Object -First 1"`) do set "PC_IP=%%i"

echo Detected Local IP: %PC_IP%
echo.
echo The system will start in 3 seconds using http://%PC_IP%:%APP_PORT%/cctvsystem/
echo (If this IP is incorrect, you can manually enter it below now, or just wait...)
echo.

set "USER_IP="
:: Use simplified timeout for auto-start
choice /c YN /t 3 /d Y /n /m "> Auto-starting..." >nul 2>&1

echo Starting CDRRMO CCTV System Server...
start "CDRRMO CCTV System" powershell -NoExit -ExecutionPolicy Bypass -Command "cd '%~dp0server'; $env:NODE_ENV='production'; $env:PORT='%APP_PORT%'; npm start"

echo Waiting for server to initialize...
timeout /t 3 /nobreak >nul

set "APP_URL=http://%PC_IP%:%APP_PORT%/cctvsystem/"
echo.
echo ========================================================
echo   SYSTEM IS READY AT: %APP_URL%
echo   Access this link from any device in the same network.
echo ========================================================
echo.

:: Try to open in Chrome if available, otherwise default browser
set "CHROME_EXE="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"

if not "%CHROME_EXE%"=="" (
    start "" "%CHROME_EXE%" --new-window "%APP_URL%"
) else (
    start "" "%APP_URL%"
)

echo Done. You can close this window after use.
pause

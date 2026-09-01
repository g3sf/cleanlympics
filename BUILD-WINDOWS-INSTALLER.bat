@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 22 is required. Install it from https://nodejs.org/ and run this file again.
  pause
  exit /b 1
)

echo Installing Cleanlympics build dependencies...
call npm install
if errorlevel 1 goto :failed

echo Running standalone application tests...
call npm test
if errorlevel 1 goto :failed

echo Building the Cleanlympics Windows installer...
call npm run dist:win
if errorlevel 1 goto :failed

echo.
echo Installer created in apps\desktop\release
pause
exit /b 0

:failed
echo.
echo The build did not complete. Review the error above.
pause
exit /b 1

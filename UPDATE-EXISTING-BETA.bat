@echo off
setlocal
cd /d "%~dp0"
echo Updating Cleanlympics while preserving the existing database...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deployment\update-existing-server.ps1"
if errorlevel 1 goto :failed
echo.
echo The server update is complete. Your saved checklist entries were preserved.
pause
exit /b 0
:failed
echo.
echo The update did not complete. Your backup and existing database were not deleted.
pause
exit /b 1

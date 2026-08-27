@echo off
setlocal
cd /d "%~dp0"
if not exist node_modules call npm install
if not exist apps\server\.env copy apps\server\.env.example apps\server\.env
call npm run dev

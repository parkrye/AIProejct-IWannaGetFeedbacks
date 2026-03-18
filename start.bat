@echo off
chcp 65001 >nul
title AI Feedback Generator

echo ==========================================
echo   AI Feedback Generator
echo ==========================================
echo.

cd /d "%~dp0"

echo [1/2] Starting backend server (port 3001)...
start "Backend Server" cmd /k "chcp 65001 >nul && npx tsx src/server/index.ts"

timeout /t 3 /nobreak >nul

echo [2/2] Starting frontend dev server (Vite)...
start "Frontend Dev" cmd /k "chcp 65001 >nul && npx vite"

timeout /t 3 /nobreak >nul

echo.
echo ==========================================
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3001
echo ==========================================
echo.
echo Opening browser...
start http://localhost:5173

echo Done. You can close this window.
pause

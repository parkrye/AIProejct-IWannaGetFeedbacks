@echo off
title AI Feedback Generator
echo ==========================================
echo   AI 피드백 생성기 - 서버 + 프론트엔드
echo ==========================================
echo.

cd /d "%~dp0"

echo [1/2] 백엔드 서버 시작 (port 3001)...
start "Backend Server" cmd /k "npx tsx src/server/index.ts"

timeout /t 3 /nobreak >nul

echo [2/2] 프론트엔드 서버 시작 (Vite)...
start "Frontend Dev" cmd /k "npx vite"

timeout /t 3 /nobreak >nul

echo.
echo ==========================================
echo   실행 완료!
echo   프론트엔드: http://localhost:5173
echo   백엔드 API: http://localhost:3001
echo ==========================================
echo.
echo 브라우저를 열고 있습니다...
start http://localhost:5173

echo 이 창은 닫아도 됩니다.
pause

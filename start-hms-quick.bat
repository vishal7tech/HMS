@echo off
echo ========================================
echo Quick Start HMS (Development Mode)
echo ========================================
echo.

:: Set the project root directory
set PROJECT_ROOT=%~dp0

:: Start backend (no dependency checks - faster startup)
echo Starting Backend...
start "HMS Backend" cmd /k "cd /d %PROJECT_ROOT%backend && mvn spring-boot:run"

:: Wait 3 seconds for backend to initialize
timeout /t 3 /nobreak >nul

:: Start frontend
echo Starting Frontend...
start "HMS Frontend" cmd /k "cd /d %PROJECT_ROOT%frontend && npm run dev"

:: Wait 2 seconds for frontend to start
timeout /t 2 /nobreak >nul

echo.
echo HMS Application Started!
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo.
echo Opening frontend in browser...
start http://localhost:5173

pause

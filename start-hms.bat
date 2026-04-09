@echo off
echo Starting Hospital Management System...
echo.

echo ========================================
echo Starting Backend Server (Spring Boot)
echo ========================================
cd /d "%~dp0backend"
echo Backend will start on http://localhost:8080
start "Backend Server" cmd /k "mvn spring-boot:run"

echo.
echo Waiting for backend to initialize...
timeout /t 10 /nobreak >nul

echo ========================================
echo Starting Frontend Server (React)
echo ========================================
cd /d "%~dp0frontend"
echo Frontend will start on http://localhost:5173
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo HMS is starting up!
echo ========================================
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8080/swagger-ui.html
echo.
echo Default Login: admin / admin123
echo.
echo Press any key to exit this window...
pause >nul

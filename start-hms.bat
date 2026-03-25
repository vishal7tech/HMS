@echo off
echo ========================================
echo Starting HMS Application
echo ========================================
echo.

:: Set the project root directory
set PROJECT_ROOT=%~dp0

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java is not installed or not in PATH
    echo Please install Java 17 or higher
    pause
    exit /b 1
)

:: Check if Maven is installed
mvn --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Maven is not installed or not in PATH
    echo Please install Maven from https://maven.apache.org/
    pause
    exit /b 1
)

echo All prerequisites found!
echo.

:: Install frontend dependencies if node_modules doesn't exist
if not exist "%PROJECT_ROOT%frontend\node_modules" (
    echo Installing frontend dependencies...
    cd /d "%PROJECT_ROOT%frontend"
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
    echo Frontend dependencies installed successfully!
    echo.
)

:: Start backend in a new window
echo Starting Backend (Spring Boot)...
start "HMS Backend" cmd /k "cd /d %PROJECT_ROOT%backend && mvn spring-boot:run"

:: Wait a moment for backend to start
timeout /t 5 /nobreak >nul

:: Start frontend in a new window
echo Starting Frontend (Vite)...
start "HMS Frontend" cmd /k "cd /d %PROJECT_ROOT%frontend && npm run dev"

:: Wait a moment for frontend to start
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo HMS Application Started Successfully!
echo ========================================
echo.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo.
echo Both services are running in separate windows.
echo Close those windows to stop the services.
echo.
echo Press any key to open the frontend in your default browser...
pause >nul

:: Open frontend in default browser
start http://localhost:5173

echo.
echo Application is ready! Keep this window open to see the status.
echo Press Ctrl+C to stop monitoring (services will continue running).
echo.

:: Keep the script running to show status
:loop
echo Checking services status...
echo.

:: Check if backend is running (port 8080)
netstat -an | findstr ":8080" >nul
if %errorlevel% equ 0 (
    echo [RUNNING] Backend on port 8080
) else (
    echo [STOPPED]  Backend on port 8080
)

:: Check if frontend is running (port 5173)
netstat -an | findstr ":5173" >nul
if %errorlevel% equ 0 (
    echo [RUNNING] Frontend on port 5173
) else (
    echo [STOPPED]  Frontend on port 5173
)

echo.
echo Press Ctrl+C to stop monitoring...
timeout /t 30 /nobreak >nul
goto loop

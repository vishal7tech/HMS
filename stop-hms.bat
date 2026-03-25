@echo off
echo ========================================
echo Stop HMS Application
echo ========================================
echo.

echo Stopping HMS services...
echo.

:: Find and kill processes on port 8080 (backend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080"') do (
    echo Killing Backend process (PID: %%a)...
    taskkill /PID %%a /F >nul 2>&1
)

:: Find and kill processes on port 5173 (frontend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173"') do (
    echo Killing Frontend process (PID: %%a)...
    taskkill /PID %%a /F >nul 2>&1
)

:: Also kill any remaining node/maven processes related to HMS
taskkill /IM "java.exe" /FI "WINDOWTITLE eq HMS Backend*" /F >nul 2>&1
taskkill /IM "node.exe" /FI "WINDOWTITLE eq HMS Frontend*" /F >nul 2>&1

echo.
echo HMS services stopped successfully!
echo.
pause

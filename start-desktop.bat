@echo off
echo Starting EZAccounting Desktop Application...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if backend is running
echo Checking backend connection...
curl -s http://localhost:3000/health >nul 2>&1
if errorlevel 1 (
    echo Warning: Backend API is not running on localhost:3000
    echo Please start the backend first with: docker-compose up backend postgres
    echo.
    echo Do you want to continue anyway? (y/n)
    set /p choice=
    if /i "%choice%" neq "y" exit /b 1
)

REM Navigate to frontend directory and start the app
cd frontend
echo Installing dependencies...
call npm install

echo Starting desktop application...
call npm run start:dev

pause



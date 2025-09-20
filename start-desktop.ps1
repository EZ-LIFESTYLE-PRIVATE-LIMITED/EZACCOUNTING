# EZAccounting Desktop Application Startup Script
Write-Host "Starting EZAccounting Desktop Application..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if backend is running
Write-Host "Checking backend connection..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 5 -UseBasicParsing
    Write-Host "Backend API is running ✓" -ForegroundColor Green
} catch {
    Write-Host "Warning: Backend API is not running on localhost:3000" -ForegroundColor Yellow
    Write-Host "Please start the backend first with: docker-compose up backend postgres" -ForegroundColor Yellow
    Write-Host ""
    $choice = Read-Host "Do you want to continue anyway? (y/n)"
    if ($choice -ne "y" -and $choice -ne "Y") {
        exit 1
    }
}

# Navigate to frontend directory and start the app
Set-Location frontend

Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Starting desktop application..." -ForegroundColor Green
npm run start:dev

Read-Host "Press Enter to exit"



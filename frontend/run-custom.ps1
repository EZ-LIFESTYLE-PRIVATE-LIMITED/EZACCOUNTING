# EZAccounting Custom Configuration Script
Write-Host "Starting EZAccounting with custom configuration..." -ForegroundColor Green
Write-Host ""

# Set custom backend URL
$env:EZACCOUNTING_BACKEND_URL="http://192.168.1.100:3000"

# Set custom database path
$env:EZACCOUNTING_DB_PATH="C:\MyAccountingData"

# Set custom database name
$env:EZACCOUNTING_DB_NAME="myaccounting.db"

Write-Host "Backend URL: $env:EZACCOUNTING_BACKEND_URL" -ForegroundColor Yellow
Write-Host "Database Path: $env:EZACCOUNTING_DB_PATH" -ForegroundColor Yellow
Write-Host "Database Name: $env:EZACCOUNTING_DB_NAME" -ForegroundColor Yellow
Write-Host ""

# Start the application
Start-Process "EZAccounting.exe"

Write-Host "Application started!" -ForegroundColor Green



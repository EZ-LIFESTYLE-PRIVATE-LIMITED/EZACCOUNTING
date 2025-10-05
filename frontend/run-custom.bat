@echo off
echo Starting EZAccounting with custom configuration...
echo.

REM Set custom backend URL
set EZACCOUNTING_BACKEND_URL=http://192.168.1.100:3000

REM Set custom database path
set EZACCOUNTING_DB_PATH=C:\MyAccountingData

REM Set custom database name
set EZACCOUNTING_DB_NAME=myaccounting.db

echo Backend URL: %EZACCOUNTING_BACKEND_URL%
echo Database Path: %EZACCOUNTING_DB_PATH%
echo Database Name: %EZACCOUNTING_DB_NAME%
echo.

REM Start the application
EZAccounting.exe

pause



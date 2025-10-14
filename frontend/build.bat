@echo off
echo Building EZAccounting Desktop Application...
echo.

REM Disable code signing completely
set CSC_IDENTITY_AUTO_DISCOVERY=false
set ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES=true

REM Build the application
call npm run build

REM Build the distributable without code signing
call npx electron-builder --dir --publish=never --config.forceCodeSigning=false --config.win.sign=false

echo.
echo Build completed!
pause

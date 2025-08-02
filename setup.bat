@echo off
REM Anuva Taru Silver Website Setup Script for Windows

echo === Anuva Taru Silver Website Setup ===
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js first:
    echo Visit: https://nodejs.org/en/download/
    echo.
    pause
    exit /b 1
)

REM Check Node.js version
echo Node.js version:
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Check npm version
echo npm version:
npm --version
echo.

REM Install dependencies
echo Installing dependencies...
npm install

if %errorlevel% equ 0 (
    echo.
    echo Dependencies installed successfully!
    echo.
    
    REM Create necessary directories
    echo Creating necessary directories...
    if not exist "database" mkdir database
    if not exist "uploads" mkdir uploads
    
    echo.
    echo === Setup Complete! ===
    echo.
    echo To start the server:
    echo   npm start
    echo.
    echo Access the application:
    echo   User Frontend: http://localhost:3000
    echo   Admin Panel: http://localhost:3000/admin
    echo.
    echo Default admin credentials:
    echo   Email: admin@anuvataru.com
    echo   Password: admin123
    echo.
    echo Note: Please add jewelry images to public/images/ directory
    echo See public/images/README.md for required image list
    echo.
) else (
    echo.
    echo Error installing dependencies. Please check your internet connection and try again.
    pause
    exit /b 1
)

pause

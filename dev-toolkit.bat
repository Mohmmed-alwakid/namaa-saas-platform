@echo off
title Namaa Investment Platform - Smart Development Environment

echo ========================================================
echo    Namaa Investment Platform - Development Toolkit
echo ========================================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed or not in PATH
    pause
    exit /b 1
)

echo ✅ Node.js and npm are available

REM Check if node_modules exists
if not exist "node_modules" (
    echo.
    echo 📦 Installing dependencies...
    npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
)

echo.
echo 🔍 Checking current port status...
echo.

REM Check port 5180 (Frontend)
netstat -ano | findstr :5180 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  Port 5180 (Frontend) is currently in use
    echo Processes using port 5180:
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5180') do (
        if not "%%a"=="0" (
            for /f "tokens=1" %%b in ('tasklist /FI "PID eq %%a" /FO CSV /NH 2^>nul ^| findstr /V "INFO:"') do (
                echo    - %%b ^(PID: %%a^)
            )
        )
    )
    echo.
) else (
    echo ✅ Port 5180 (Frontend) is available
)

REM Check port 3005 (Backend)
netstat -ano | findstr :3005 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  Port 3005 (Backend) is currently in use
    echo Processes using port 3005:
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3005') do (
        if not "%%a"=="0" (
            for /f "tokens=1" %%b in ('tasklist /FI "PID eq %%a" /FO CSV /NH 2^>nul ^| findstr /V "INFO:"') do (
                echo    - %%b ^(PID: %%a^)
            )
        )
    )
    echo.
) else (
    echo ✅ Port 3005 (Backend) is available
)

echo.
echo 🟢 Active Node.js processes:
tasklist /FI "IMAGENAME eq node.exe" /FO CSV /NH 2>nul | findstr /V "INFO:" | (
    set /a count=0
    for /f "tokens=1,2" %%a in ('more') do (
        if not "%%a"=="" (
            set /a count+=1
            echo    - %%a ^(PID: %%b^)
        )
    )
    if !count! EQU 0 echo    No Node.js processes currently running
)

echo.
echo ========================================================
echo                 Development Options
echo ========================================================
echo.
echo [1] Smart Development Server (Recommended)
echo     Automatically finds available ports and starts both frontend and backend
echo.
echo [2] Standard Full-Stack Development
echo     Uses default ports (5180 frontend, 3005 backend)
echo.
echo [3] Frontend Only
echo     Start only the React frontend development server
echo.
echo [4] Backend Only  
echo     Start only the Express.js backend API server
echo.
echo [5] Port Management
echo     Check ports, clean up processes, view detailed reports
echo.
echo [6] Build for Production
echo     Create optimized production build
echo.
echo [7] Run Tests
echo     Execute test suite and type checking
echo.
echo [8] Exit
echo.

set /p choice="Select an option (1-8): "

if "%choice%"=="1" (
    echo.
    echo ========================================================
    echo          Starting Smart Development Server
    echo ========================================================
    echo 🧠 The smart server will automatically:
    echo    - Find available ports to avoid conflicts
    echo    - Start both frontend and backend services
    echo    - Provide detailed status information
    echo    - Handle graceful shutdown
    echo.
    echo Press Ctrl+C to stop all services when done
    echo.
    node smart-dev-server-v2.cjs
) else if "%choice%"=="2" (
    echo.
    echo ========================================================
    echo         Starting Standard Full-Stack Server
    echo ========================================================
    echo 🚀 Starting both frontend and backend on default ports...
    echo    Frontend: http://localhost:5180
    echo    Backend:  http://localhost:3005
    echo.
    echo Press Ctrl+C to stop all services when done
    echo.
    npm run dev:fullstack
) else if "%choice%"=="3" (
    echo.
    echo ========================================================
    echo              Starting Frontend Only
    echo ========================================================
    echo 🎨 Starting React development server...
    echo    Available at: http://localhost:5180
    echo.
    echo Press Ctrl+C to stop when done
    echo.
    npm run dev:client
) else if "%choice%"=="4" (
    echo.
    echo ========================================================
    echo              Starting Backend Only
    echo ========================================================
    echo 🔧 Starting Express.js API server...
    echo    Available at: http://localhost:3005
    echo    Health check: http://localhost:3005/api/health
    echo.
    echo Press Ctrl+C to stop when done
    echo.
    npm run dev:local
) else if "%choice%"=="5" (
    echo.
    echo ========================================================
    echo               Port Management Tools
    echo ========================================================
    echo.
    echo [5a] Detailed Port Check
    echo [5b] Clean Up Project Ports
    echo [5c] View Process Report
    echo [5d] Back to Main Menu
    echo.
    set /p portChoice="Select option (5a-5d): "
    
    if "!portChoice!"=="5a" (
        echo.
        echo 🔍 Running detailed port analysis...
        node scripts/port-manager.cjs
        pause
    ) else if "!portChoice!"=="5b" (
        echo.
        echo 🧹 Cleaning up project ports (5180, 3005)...
        echo ⚠️  This will stop any processes using these ports!
        set /p confirm="Are you sure? (y/N): "
        if /I "!confirm!"=="y" (
            node -e "const pm = require('./scripts/port-manager.cjs'); pm.killProcessesOnPort(5180).then(() => pm.killProcessesOnPort(3005));"
        ) else (
            echo Operation cancelled.
        )
        pause
    ) else if "!portChoice!"=="5c" (
        echo.
        echo 📊 Generating process report...
        echo.
        echo Active Node.js processes:
        tasklist /FI "IMAGENAME eq node.exe" /FO TABLE 2>nul
        echo.
        echo Ports in use:
        netstat -ano | findstr ":5180 :3005 :3000 :5173"
        pause
    ) else (
        goto main_menu
    )
    goto main_menu
) else if "%choice%"=="6" (
    echo.
    echo ========================================================
    echo             Building for Production
    echo ========================================================
    echo 🏗️  Creating optimized production build...
    echo.
    npm run build
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✅ Build completed successfully!
        echo 📁 Output directory: dist/
        echo.
        echo You can preview the build with: npm run preview
    ) else (
        echo.
        echo ❌ Build failed. Please check the errors above.
    )
    pause
) else if "%choice%"=="7" (
    echo.
    echo ========================================================
    echo                 Running Tests
    echo ========================================================
    echo 🧪 Running test suite and type checking...
    echo.
    echo Checking TypeScript types...
    npm run type-check
    echo.
    echo Running linter...
    npm run lint
    echo.
    echo ✅ All checks completed!
    pause
) else if "%choice%"=="8" (
    echo.
    echo 👋 Thanks for using Namaa Investment Platform!
    echo    Happy coding! 🚀
    echo.
    exit /b 0
) else (
    echo.
    echo ❌ Invalid selection. Please choose 1-8.
    pause
    goto main_menu
)

:main_menu
goto :eof

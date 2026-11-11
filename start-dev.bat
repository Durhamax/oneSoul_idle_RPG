@echo off
REM OneSoul Idle RPG - Development Server Launcher
REM Run this after pulling latest changes to see updates

echo ========================================
echo  OneSoul Idle RPG - Dev Server
echo ========================================
echo.

echo [1/2] Pulling latest changes...
git pull origin claude/access-game-feature-01HHFMH1D52sgs95PGD7VjWM
echo.

echo [2/2] Starting development server...
echo.

REM Check for Node.js first (preferred)
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Node.js found - starting local server on port 8080
    echo Press Ctrl+C to stop the server when done
    echo.
    start http://localhost:8080/index.html
    timeout /t 2 /nobreak >nul
    node server.js 8080
    goto :end
)

REM Check for Python as fallback
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Python found - starting local server on port 8080
    echo Press Ctrl+C to stop the server when done
    echo.
    start http://localhost:8080/index.html
    timeout /t 2 /nobreak >nul
    python -m http.server 8080
    goto :end
)

REM No server available - open file directly
echo ⚠️  No local server found (Node.js or Python needed)
echo.
echo Opening game with file:// protocol...
echo NOTE: Some features may not work without a local server.
echo.
echo 💡 To fix this, install either:
echo    • Node.js: https://nodejs.org/ (Recommended)
echo    • Python: https://www.python.org/downloads/
echo.
start "" "%~dp0index.html"

:end
echo.
pause

@echo off
REM OneSoul Idle RPG - Development Server Launcher
REM Run this after pulling latest changes to see updates

echo ========================================
echo  OneSoul Idle RPG - Dev Server
echo ========================================
echo.

echo [1/3] Pulling latest changes...
git pull origin claude/access-game-feature-01HHFMH1D52sgs95PGD7VjWM
echo.

echo [2/3] Starting local server on port 8080...
echo Press Ctrl+C to stop the server when done
echo.

start http://localhost:8080/index.html
python -m http.server 8080

REM When you Ctrl+C the server, this will show:
echo.
echo Server stopped. Close this window.
pause

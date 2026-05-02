@echo off
echo Starting Cho Tot...
start "Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"
timeout /t 2 /nobreak >nul
start "Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"
echo Backend: http://localhost:5024
echo Frontend: http://localhost:5174

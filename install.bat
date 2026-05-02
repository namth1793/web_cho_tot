@echo off
echo Installing Cho Tot website...
cd /d "%~dp0backend"
call npm install
node db/seed.js
cd /d "%~dp0frontend"
call npm install
echo Done! Run start.bat to launch.
pause

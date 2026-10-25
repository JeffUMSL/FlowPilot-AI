@echo off
cd /d "%~dp0"
if not exist "package.json" (
  echo package.json is missing. Re-extract the project ZIP.
  pause
  exit /b 1
)
call npm run dev
if errorlevel 1 echo Failed to start Next.js. Run npm install in the project root.
pause

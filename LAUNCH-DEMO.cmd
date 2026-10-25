@echo off
setlocal
cd /d "%~dp0"
if not exist "package.json" (
  echo ERROR: Run this launcher inside the extracted project folder with package.json.
  pause
  exit /b 1
)
if not exist "backend\app.py" (
  echo ERROR: backend\app.py is missing. Re-extract the FULL Step 5 project ZIP.
  pause
  exit /b 1
)
if not exist "backend\.env" (
  echo WARNING: backend\.env is missing. Copy backend\.env.example to backend\.env.
  echo The website may start, but the AI provider may not be configured.
)
echo Opening separate consoles for the website and Python backend.
echo Check http://127.0.0.1:8000/api/health for AI provider status.
echo This is a LOCAL demo only. No publicly reachable server is created.
start "MyPortfolio Python AI" "%~dp0START-BACKEND.cmd"
start "MyPortfolio Website" "%~dp0START-WEBSITE.cmd"
echo Open http://localhost:3000 when Ready appears in the website console.
pause

@echo off
cd /d "%~dp0backend"
if not exist "app.py" (
  echo Backend app.py is missing. Re-extract the project ZIP.
  pause
  exit /b 1
)
python -m uvicorn app:app --host 127.0.0.1 --port 8000
if errorlevel 1 echo Failed to start Python. Check that backend dependencies are installed.
pause
